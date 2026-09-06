"""Vercel serverless entrypoint for the V.A.R.U.N.A. FastAPI backend.

Vercel's Python runtime looks for an ASGI ``app`` in ``api/index.py``
(or an entrypoint declared via ``tool.vercel.entrypoint`` in
``pyproject.toml``). The real application lives in ``backend/app/main.py``,
so this shim puts ``backend/`` on ``sys.path`` and re-exports it.
"""

import os
import sys

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.abspath(os.path.join(_CURRENT_DIR, ".."))
_BACKEND_DIR = os.path.join(_REPO_ROOT, "backend")

# ``backend/app`` is the ``app`` package; repo root hosts ``ml_pipeline``.
for _path in (_REPO_ROOT, _BACKEND_DIR):
    if _path not in sys.path:
        sys.path.insert(0, _path)

from app.main import app  # noqa: E402

__all__ = ["app"]
