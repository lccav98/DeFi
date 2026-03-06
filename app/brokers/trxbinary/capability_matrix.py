from enum import Enum


class IntegrationRecommendation(str, Enum):
    LIVE_API = "LIVE_API"
    LIVE_COPYTRADE = "LIVE_COPYTRADE"
    PAPER_ONLY = "PAPER_ONLY"


CAPABILITY_MATRIX = {
    "official_api_confirmed": {
        True: IntegrationRecommendation.LIVE_API,
        False: IntegrationRecommendation.PAPER_ONLY,
    },
    "official_copytrade_confirmed": {
        True: IntegrationRecommendation.LIVE_COPYTRADE,
        False: IntegrationRecommendation.PAPER_ONLY,
    },
}
