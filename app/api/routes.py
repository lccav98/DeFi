from app.brokers.trxbinary.integration_audit import IntegrationAuditService
from app.execution.live_executor import LiveExecutor
from app.execution.paper_executor import PaperExecutor


def health() -> dict[str, str]:
    return {"status": "ok"}


def integration_status() -> dict:
    audit = IntegrationAuditService().run_offline_audit()
    return audit.to_dict()


def execution_mode() -> dict[str, str]:
    return {"paper": PaperExecutor.__name__, "live": LiveExecutor.__name__}


def register_routes(app) -> None:
    @app.get("/health")
    def _health():
        return health()

    @app.get("/integration/status")
    def _status():
        return integration_status()

    @app.get("/execution/mode")
    def _mode():
        return execution_mode()
