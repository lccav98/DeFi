from dataclasses import dataclass


@dataclass
class OfficialApiClient:
    enabled: bool = False

    def authenticate(self) -> None:
        if not self.enabled:
            raise RuntimeError("Official API client disabled until integration audit confirms LIVE_API")

    def get_balance(self) -> dict:
        return {"status": "unavailable", "reason": "No official API confirmed"}

    def place_order(self, side: str, amount: float, asset: str, expiry_seconds: int) -> dict:
        raise RuntimeError("Order placement blocked: official API not confirmed")
