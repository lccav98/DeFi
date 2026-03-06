from app.brokers.trxbinary.capability_matrix import IntegrationRecommendation
from app.brokers.trxbinary.integration_audit import IntegrationAuditService
from app.execution.live_executor import LiveExecutor


def test_default_audit_is_paper_only():
    result = IntegrationAuditService().run_offline_audit()
    assert result.recommendation == IntegrationRecommendation.PAPER_ONLY


def test_live_requires_enable_flag():
    executor = LiveExecutor(recommendation=IntegrationRecommendation.LIVE_API)
    try:
        executor.validate_live_mode()
    except RuntimeError as exc:
        assert "ENABLE_LIVE" in str(exc)
    else:
        raise AssertionError("Expected validation error")
