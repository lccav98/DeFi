from dataclasses import dataclass


@dataclass
class OfficialCopyTradeClient:
    enabled: bool = False

    def activate(self, trader_id: str, max_stake: float) -> dict:
        if not self.enabled:
            raise RuntimeError("Copy trade blocked: official capability not confirmed")
        return {"trader_id": trader_id, "max_stake": max_stake, "status": "activated"}

    def deactivate(self) -> dict:
        return {"status": "deactivated"}
