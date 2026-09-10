"""Train VARUNA v1 oil-slick image classifier (REAL supervised training).

Dataset: Sentinel-1 SAR Oil Spill Detection Dataset (CSIRO DAP, Asia-Pacific
101-154E / 26S-21N): 3695 Class_0 (non-oil incl. look-alikes) + 1843 Class_1
(oil) 400x400 JPEG scenes. IMAGE-LEVEL labels only (no pixel masks), so this
trains a slick-presence classifier whose CAM heatmaps refine the classical
segmentation — it is honestly a classifier + CAM stage, NOT a pixel-supervised
U-Net (see README prototype limits).

Imbalance handling (Class_0:Class_1 ~ 2:1): stratified 80/10/10 split,
inverse-frequency class-weighted cross-entropy, threshold tuned on validation
F1, and per-class precision/recall/F1/AUC reported (never accuracy alone).

Usage (from repo root):
    python ml_pipeline/segmentation/train_oil_classifier.py [--epochs 12]

Outputs:
    ml_pipeline/segmentation/weights/varuna_oil_cnn_v1.pt
    ml_pipeline/segmentation/weights/training_metrics_v1.json
"""

import argparse
import json
import os
import random
import sys
import time

import numpy as np
from PIL import Image

_HERE = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
_DEFAULT_DATA = os.path.join(os.path.dirname(_REPO_ROOT), "sar-dataset", "kaggle", "data")
_WEIGHTS_DIR = os.path.join(_HERE, "weights")

IMG_SIZE = 192
SEED = 42


def set_seeds(seed: int = SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)
    import torch
    torch.manual_seed(seed)
    torch.set_num_threads(max(1, os.cpu_count() or 4))


def collect(data_dir: str):
    """Returns ([(path, label)], class_counts). Label 1 = oil."""
    import glob
    items = []
    for label, cls in ((0, "Class_0"), (1, "Class_1")):
        for p in sorted(glob.glob(os.path.join(data_dir, cls, "*.jpg"))):
            items.append((p, label))
    if not items:
        raise FileNotFoundError(f"No training images under {data_dir}")
    return items


def build_datasets(items, img_size: int = IMG_SIZE):
    """Stratified 80/10/10 split; returns (train, val, test) item lists."""
    from sklearn.model_selection import train_test_split
    paths = [p for p, _ in items]
    labels = [l for _, l in items]
    train, temp = train_test_split(paths, test_size=0.20, random_state=SEED,
                                   stratify=labels)
    lab_of = dict(items)
    temp_labels = [lab_of[p] for p in temp]
    val, test = train_test_split(temp, test_size=0.50, random_state=SEED,
                                 stratify=temp_labels)
    to_items = lambda ps: [(p, lab_of[p]) for p in ps]
    return to_items(train), to_items(val), to_items(test)


class SARDataset:
    """Grayscale normalized scenes + labels (numpy-backed, torch tensors)."""

    def __init__(self, items, mean: float = 0.5, std: float = 0.25):
        import torch
        self.items = items
        self.mean = mean
        self.std = std
        self.torch = torch

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        path, label = self.items[i]
        img = Image.open(path).convert("L").resize((IMG_SIZE, IMG_SIZE))
        arr = np.asarray(img, dtype=np.float32) / 255.0
        arr = (arr - self.mean) / self.std
        x = self.torch.from_numpy(arr).unsqueeze(0)  # (1, H, W)
        return x, self.torch.tensor(label, dtype=self.torch.long)


def build_model():
    """Tiny GAP-CNN (~300k params): conv blocks 16/32/64/128 + GAP + FC(2).

    Global-average-pooling head keeps the model CAM-capable so slick
    heatmaps can be derived from the final FC weights at inference.
    """
    import torch
    import torch.nn as nn

    def block(cin, cout):
        return nn.Sequential(
            nn.Conv2d(cin, cout, 3, padding=1, bias=False),
            nn.BatchNorm2d(cout),
            nn.ReLU(inplace=True),
            nn.Conv2d(cout, cout, 3, padding=1, bias=False),
            nn.BatchNorm2d(cout),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )

    class OilCNN(nn.Module):
        def __init__(self):
            super().__init__()
            self.features = nn.Sequential(
                block(1, 16), block(16, 32), block(32, 64), block(64, 128),
            )
            self.gap = nn.AdaptiveAvgPool2d(1)
            self.drop = nn.Dropout(0.3)
            self.fc = nn.Linear(128, 2)

        def forward(self, x):
            f = self.features(x)          # (B,128,H/16,W/16) kept for CAM
            g = self.gap(f).flatten(1)
            return self.fc(self.drop(g)), f

    model = OilCNN()
    n_params = sum(p.numel() for p in model.parameters())
    print(f"model params: {n_params:,}")
    return model


def batches(dataset, batch_size: int, shuffle: bool, seed: int):
    import torch
    idx = list(range(len(dataset)))
    if shuffle:
        g = torch.Generator().manual_seed(seed)
        idx = torch.randperm(len(dataset), generator=g).tolist()
    for s in range(0, len(idx), batch_size):
        xs, ys = [], []
        for i in idx[s:s + batch_size]:
            x, y = dataset[i]
            xs.append(x)
            ys.append(y)
        yield torch.stack(xs), torch.stack(ys)


def evaluate(model, dataset, device, batch_size: int = 128):
    """Returns (probs_pos, labels) over a split."""
    import torch
    model.eval()
    probs, labels = [], []
    with torch.no_grad():
        for xb, yb in batches(dataset, batch_size, False, SEED):
            xb, yb = xb.to(device), yb.to(device)
            logits, _ = model(xb)
            probs.extend(torch.softmax(logits, 1)[:, 1].tolist())
            labels.extend(yb.cpu().tolist())
    return np.array(probs), np.array(labels)


def report_metrics(name, y_true, y_prob, threshold: float):
    from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                                 precision_score, recall_score, roc_auc_score)
    y_pred = (y_prob >= threshold).astype(int)
    return {
        "split": name,
        "n": int(len(y_true)),
        "threshold": round(float(threshold), 4),
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "auc": round(float(roc_auc_score(y_true, y_prob)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "precision_oil": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall_oil": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "precision_clean": round(float(precision_score(1 - y_true, 1 - y_pred, zero_division=0)), 4),
        "recall_clean": round(float(recall_score(1 - y_true, 1 - y_pred, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", default=_DEFAULT_DATA)
    ap.add_argument("--epochs", type=int, default=12)
    ap.add_argument("--batch-size", type=int, default=64)
    ap.add_argument("--lr", type=float, default=3e-3)
    args = ap.parse_args()

    import torch
    import torch.nn as nn

    set_seeds()
    os.makedirs(_WEIGHTS_DIR, exist_ok=True)

    items = collect(args.data_dir)
    n1 = sum(1 for _, l in items if l == 1)
    print(f"dataset: {len(items)} scenes ({len(items) - n1} clean / {n1} oil)")
    train_items, val_items, test_items = build_datasets(items)
    print(f"split: train={len(train_items)} val={len(val_items)} test={len(test_items)} (stratified)")

    # Dataset mean/std from a train subset for normalization honesty.
    sample = []
    for p, _ in train_items[:256]:
        sample.append(np.asarray(Image.open(p).convert("L").resize((IMG_SIZE, IMG_SIZE)),
                                 dtype=np.float32).ravel())
    mean = float(np.concatenate(sample).mean() / 255.0)
    std = float(np.concatenate(sample).std() / 255.0)
    print(f"normalization: mean={mean:.4f} std={std:.4f}")

    train_ds = SARDataset(train_items, mean, std)
    val_ds = SARDataset(val_items, mean, std)
    test_ds = SARDataset(test_items, mean, std)

    # Inverse-frequency class weights (imbalance fix, deterministic order).
    counts = np.bincount([l for _, l in train_items], minlength=2).astype(float)
    weights = torch.tensor([len(train_items) / (2 * c) for c in counts],
                           dtype=torch.float32)
    print(f"class weights (clean/oil): {[round(float(w), 3) for w in weights]}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"device: {device}"
          + (f" ({torch.cuda.get_device_name(0)})" if device.type == "cuda" else ""))

    model = build_model().to(device)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr)
    crit = nn.CrossEntropyLoss(weight=weights.to(device))

    best_f1, best_state, best_thr = -1.0, None, 0.5
    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        model.train()
        tot_loss, tot_n = 0.0, 0
        for xb, yb in batches(train_ds, args.batch_size, True, SEED + epoch):
            xb, yb = xb.to(device), yb.to(device)
            opt.zero_grad()
            logits, _ = model(xb)
            loss = crit(logits, yb)
            loss.backward()
            opt.step()
            tot_loss += float(loss.item()) * len(xb)
            tot_n += len(xb)
        vp, vy = evaluate(model, val_ds, device)
        # Threshold tuned on validation F1 (not fixed 0.5).
        cand = report_metrics("val", vy, vp, 0.5)
        thr_grid = np.linspace(0.2, 0.8, 13)
        from sklearn.metrics import f1_score
        f1s = [f1_score(vy, (vp >= t).astype(int), zero_division=0) for t in thr_grid]
        thr = float(thr_grid[int(np.argmax(f1s))])
        rep = report_metrics("val", vy, vp, thr)
        if rep["f1"] > best_f1:
            best_f1 = rep["f1"]
            best_thr = thr
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
        print(f"epoch {epoch:02d}/{args.epochs} loss={tot_loss / tot_n:.4f} "
              f"valF1={rep['f1']:.4f} valAUC={rep['auc']:.4f} thr={thr:.2f} ({time.time() - t0:.0f}s)")

    model.load_state_dict(best_state)
    vp, vy = evaluate(model, val_ds, device)
    tp, ty = evaluate(model, test_ds, device)
    val_rep = report_metrics("val", vy, vp, best_thr)
    test_rep = report_metrics("test(held-out)", ty, tp, best_thr)

    ckpt_path = os.path.join(_WEIGHTS_DIR, "varuna_oil_cnn_v1.pt")
    torch.save({
        "arch": "OilCNN-GAP-16/32/64/128",
        "img_size": IMG_SIZE,
        "mean": mean,
        "std": std,
        "threshold": best_thr,
        "state_dict": best_state,
        "dataset": {"n_total": len(items), "n_oil": n1,
                    "split_seed": SEED, "split": "80/10/10 stratified"},
    }, ckpt_path)

    metrics = {
        "model": "varuna_oil_cnn_v1 (image-level oil-presence CNN + CAM; NOT pixel-supervised U-Net)",
        "dataset": "Sentinel-1 SAR Oil Spill Detection Dataset (CSIRO DAP, Asia-Pacific)",
        "val": val_rep,
        "test": test_rep,
        "checkpoint": os.path.basename(ckpt_path),
        "size_bytes": os.path.getsize(ckpt_path),
    }
    mpath = os.path.join(_WEIGHTS_DIR, "training_metrics_v1.json")
    with open(mpath, "w") as f:
        json.dump(metrics, f, indent=2)
    print("TEST (held-out):", json.dumps(test_rep, indent=2))
    print(f"saved {ckpt_path} + {mpath}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
