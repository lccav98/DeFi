from dataclasses import dataclass


@dataclass
class RiskLimits:
    daily_stop_loss: float
    daily_stop_win: float
    max_consecutive_losses: int
    max_session_exposure: float
