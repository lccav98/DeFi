"""API entrypoint.

If FastAPI is available, exposes an ASGI app.
Otherwise, keeps a lightweight placeholder for offline development.
"""

from app.core.logging import configure_logging

configure_logging()

try:
    from fastapi import FastAPI

    from app.api.routes import register_routes

    app = FastAPI(title="TRX Binary Quant Platform", version="0.1.0")
    register_routes(app)
except Exception:  # pragma: no cover
    app = None
