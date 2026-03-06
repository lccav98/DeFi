from dataclasses import dataclass


@dataclass
class SignalAudit:
    strategy: str
    side: str
    quality_score: float
    is_live: bool = False
