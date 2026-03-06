from dataclasses import dataclass

from app.brokers.trxbinary.capability_matrix import IntegrationRecommendation
from app.core.config import settings


@dataclass
class LiveExecutor:
    recommendation: IntegrationRecommendation

    def validate_live_mode(self) -> None:
        if not settings.enable_live:
            raise RuntimeError("LIVE mode requires ENABLE_LIVE=true")
        if self.recommendation not in {
            IntegrationRecommendation.LIVE_API,
            IntegrationRecommendation.LIVE_COPYTRADE,
        }:
            raise RuntimeError("LIVE blocked by integration audit")
