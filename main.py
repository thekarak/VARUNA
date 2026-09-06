"""Root ASGI entrypoint shim for platform hosts (e.g. Render).

Some hosts run ``uvicorn main:app`` from the repository root (Render
dashboard Start Command overrides included). The real application lives in
``backend/app/main.py``, so this shim puts ``backend/`` on ``sys.path`` and
re-exports the FastAPI ``app``. Safe to import from any working directory.
"""

import os
import sys

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.join(_CURRENT_DIR, "backend")

# ``backend/app`` is the ``app`` package; repo root hosts ``ml_pipeline``.
for _path in (_CURRENT_DIR, _BACKEND_DIR):
    if _path not in sys.path:
        sys.path.insert(0, _path)

from app.main import app  # noqa: E402

__all__ = ["app"]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )
