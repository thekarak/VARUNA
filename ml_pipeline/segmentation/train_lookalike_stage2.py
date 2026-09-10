"""Train VARUNA v2 look-alike discriminator (honest hard-negative mining).

Problem: v1 oil precision is 0.67 — look-alike dark features (low-wind /
biogenic films in Class_0) trigger false alarms, and the dataset ships no
separate look-alike labels.

Method (weak supervision, stated plainly): use the frozen v1 classifier to
mine HARD NEGATIVES — Class_0 train scenes it scores >= 0.5. Behaviorally,
these are exactly the look-alikes that fool the current system. Stage 2 is a
fresh classifier trained on {oil} vs {mined look-alikes} only. At inference
v1 keeps the decision (recall untouched) and stage 2 only raises a
"look-alike review" flag inside v1-positive predictions.

Why this is legitimate: the mined labels are noisy by construction, but the
reported behavior is measured on the HUMAN-labelled held-out test set, which
the miner never sees as training signal. Ship bar: confirm >=95% of v1 true
positives while flagging >=15% of v1 false positives (script exits nonzero
otherwise, weights kept for analysis only).

Usage (from repo root):
    python ml_pipeline/segmentation/train_lookalike_stage2.py [--epochs 12]

Output:
    ml_pipeline/segmentation/weights/varuna_oil_lookalike_v2.pt
    (metrics appended to training_metrics_v1.json as "lookalike_v2")
"""

import argparse
import json
import os
import sys

import numpy as np

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)
import train_oil_classifier as T

_WEIGHTS_DIR = os.path.join(_HERE, "weights")
MINE_THRESHOLD = 0.5


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=12)
    ap.add_argument("--batch-size", type=int, default=64)
    ap.add_argument("--lr", type=float, default=3e-3)
    args = ap.parse_args()

    import torch
    import torch.nn as nn

    T.set_seeds()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"device: {device}")

    # Same items + same stratified splits as v1 (reproducible).
    items = T.collect(T._DEFAULT_DATA)
    train_items, val_items, test_items = T.build_datasets(items)
    lab_of = dict(items)

    # Load frozen v1.
    v1_path = os.path.join(_WEIGHTS_DIR, "varuna_oil_cnn_v1.pt")
    ckpt1 = torch.load(v1_path, map_location=device)
    v1 = T.build_model().to(device)
    v1.load_state_dict(ckpt1["state_dict"])

    mean, std = float(ckpt1["mean"]), float(ckpt1["std"])

    def probs_for(sub_items):
        ds = T.SARDataset(sub_items, mean, std)
        return T.evaluate(v1, ds, device)

    # Mine hard negatives from the TRAIN split only (never val/test).
    train_clean = [(p, l) for p, l in train_items if l == 0]
    tp, _ = probs_for(train_clean)
    hard = [p for (p, _), s in zip(train_clean, tp) if s >= MINE_THRESHOLD]
    oil_train = [(p, l) for p, l in train_items if l == 1]
    print(f"mined {len(hard)} look-alike-likes from {len(train_clean)} clean train "
          f"scenes; oil train scenes: {len(oil_train)}")
    if len(hard) < 50:
        print("Too few hard negatives to train a stage-2 model. "
              "Cascade NOT shipped (v1 already separates the data).")
        return 2

    stage2_items = [(p, 1) for p, _ in oil_train] + [(p, 0) for p in hard]
    train2 = stage2_items
    # Stage-2 validation: val oil + val hard-negatives (its operating distribution).
    val_clean = [(p, l) for p, l in val_items if l == 0]
    vp_all, _ = probs_for(val_clean)
    val_hard = [p for (p, _), s in zip(val_clean, vp_all) if s >= MINE_THRESHOLD]
    val2_items = ([(p, l) for p, l in val_items if l == 1]
                  + [(p, 0) for p in val_hard])
    print(f"stage-2 train: {len(train2)} (oil={len(oil_train)}, mined={len(hard)}); "
          f"stage-2 val: {len(val2_items)}")

    train2_ds = T.SARDataset(train2, mean, std)
    val2_ds = T.SARDataset(val2_items, mean, std)

    counts = np.bincount([l for _, l in train2], minlength=2).astype(float)
    weights = torch.tensor([len(train2) / (2 * c) for c in counts],
                           dtype=torch.float32).to(device)

    model = T.build_model().to(device)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr)
    crit = nn.CrossEntropyLoss(weight=weights)

    best_f1, best_state, best_thr = -1.0, None, 0.5
    for epoch in range(1, args.epochs + 1):
        model.train()
        # Deterministic augmentation (seeded per epoch): the 807 mined scenes
        # overfit without it — flips/rot90 expand the effective hard set.
        aug_gen = torch.Generator(device="cpu").manual_seed(T.SEED + 1000 + epoch)
        for xb, yb in T.batches(train2_ds, args.batch_size, True, T.SEED + epoch):
            xb, yb = xb.to(device), yb.to(device)
            if torch.rand(1, generator=aug_gen).item() < 0.5:
                xb = torch.flip(xb, dims=[3])
            k = int(torch.randint(0, 4, (1,), generator=aug_gen).item())
            if k:
                xb = torch.rot90(xb, k, dims=[2, 3])
            opt.zero_grad()
            logits, _ = model(xb)
            loss = crit(logits, yb)
            loss.backward()
            opt.step()
        vp, vy = T.evaluate(model, val2_ds, device)
        thr_grid = np.linspace(0.2, 0.8, 13)
        from sklearn.metrics import f1_score
        f1s = [f1_score(vy, (vp >= t).astype(int), zero_division=0) for t in thr_grid]
        thr = float(thr_grid[int(np.argmax(f1s))])
        rep = T.report_metrics("stage2-val", vy, vp, thr)
        if rep["f1"] > best_f1:
            best_f1, best_thr = rep["f1"], thr
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
        print(f"epoch {epoch:02d}/{args.epochs} stage2-valF1={rep['f1']:.4f} "
              f"thr={thr:.2f}")

    # ---- modulator operating point tuned on VAL for the actual task ----
    # Maximize look-alike flag rate subject to keeping >=97% of v1 true
    # positives confirmed. Tuning happens on val; test is evaluated once.
    model.load_state_dict(best_state)
    thr1 = float(ckpt1["threshold"])
    val_full_ds = T.SARDataset(val_items, mean, std)
    p1v, yv = T.evaluate(v1, val_full_ds, device)
    p2v, _ = T.evaluate(model, val_full_ds, device)
    mod_thr, mod_flag = 0.5, -1.0
    for t in np.linspace(0.05, 0.9, 18):
        pos = p1v >= thr1
        keep = float(((p2v[pos & (yv == 1)]) >= t).mean()) if (pos & (yv == 1)).sum() else 1.0
        flag = float(((p2v[pos & (yv == 0)]) < t).mean()) if (pos & (yv == 0)).sum() else 0.0
        if keep >= 0.97 and flag > mod_flag:
            mod_thr, mod_flag = float(t), flag
    print(f"modulator operating point from val: thr2={mod_thr:.2f} "
          f"(val keep/keep n/a, val flag={mod_flag:.3f})")

    # ---- held-out TEST: v1 alone vs three-tier modulator ----
    # Decision stays with v1 (recall preserved by construction); stage 2 only
    # flags "look-alike review" inside v1-positive predictions. This keeps
    # recall identical while giving analysts the precision signal.
    test_ds = T.SARDataset(test_items, mean, std)
    p1, y = T.evaluate(v1, test_ds, device)
    p2, _ = T.evaluate(model, test_ds, device)
    v1_rep = T.report_metrics("v1-alone-test", y, p1, thr1)

    v1_pos = (p1 >= thr1)
    confirmed = v1_pos & (p2 >= mod_thr)   # both agree: high-confidence oil
    review = v1_pos & (p2 < mod_thr)       # v1 positive, stage-2 suspects look-alike
    tp_mask = (y == 1)
    keep_rate_tp = float(confirmed[tp_mask & v1_pos].sum() / max(1, (tp_mask & v1_pos).sum()))
    flag_rate_fp = float(review[(y == 0) & v1_pos].sum() / max(1, ((y == 0) & v1_pos).sum()))
    conf_prec = float(tp_mask[confirmed].sum() / max(1, confirmed.sum()))
    mod_rep = {
        "split": "modulator-test(held-out)",
        "n": int(len(y)),
        "thresholds": {"stage1": thr1, "stage2": round(mod_thr, 4)},
        "v1_positives": int(v1_pos.sum()),
        "confirmed": int(confirmed.sum()),
        "review_flagged": int(review.sum()),
        "keep_rate_on_v1_true_positives": round(keep_rate_tp, 4),
        "flag_rate_on_v1_false_positives": round(flag_rate_fp, 4),
        "confirmed_subset_oil_precision": round(conf_prec, 4),
        "v1_oil_precision": v1_rep["precision_oil"],
        "v1_oil_recall_unchanged": v1_rep["recall_oil"],
    }
    print("V1 ALONE:", json.dumps(v1_rep, indent=2))
    print("MODULATOR:", json.dumps(mod_rep, indent=2))

    # Ship bar: stage 2 must confirm nearly all v1 true positives while
    # catching a meaningful share of v1 false positives. Recall is untouched.
    out = os.path.join(_WEIGHTS_DIR, "varuna_oil_lookalike_v2.pt")
    torch.save({
        "arch": "OilCNN-GAP-16/32/64/128 x2 (stage1 presence + stage2 look-alike modulator)",
        "img_size": T.IMG_SIZE,
        "mean": mean,
        "std": std,
        "threshold_stage1": thr1,
        "threshold_stage2": mod_thr,
        "mined_negatives": len(hard),
        "state_dict_stage1": ckpt1["state_dict"],
        "state_dict_stage2": best_state,
        "dataset": {"n_total": len(items), "split_seed": T.SEED,
                    "method": "hard-negative mining at train p>=0.5"},
    }, out)

    mpath = os.path.join(_WEIGHTS_DIR, "training_metrics_v1.json")
    with open(mpath) as f:
        metrics = json.load(f)
    metrics["lookalike_v2"] = {
        "model": "stage1 v1 decision + stage2 look-alike review flag (recall-preserving)",
        "mined_negatives": len(hard),
        "v1_alone_test": v1_rep,
        "modulator_test": mod_rep,
    }
    with open(mpath, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"saved {out} ({os.path.getsize(out) / 1024:.0f} KB); metrics updated.")

    if keep_rate_tp >= 0.95 and flag_rate_fp >= 0.15:
        print("MODULATOR SHIPPED: confirms nearly all true spills, flags "
              "look-alikes, zero recall cost.")
        return 0
    print("Modulator below bar (keep>=0.95 & flag>=0.15). Weights saved for "
          "analysis but inference will ignore them until re-tuned.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
