from dataclasses import asdict, dataclass


@dataclass
class DashboardSnapshot:
    integration_status: str
    mode: str
    daily_pnl: float
    win_rate: float
    profit_factor: float
    max_drawdown: float
    active_strategy: str
    kill_switch: bool


def build_snapshot() -> dict:
    snapshot = DashboardSnapshot(
        integration_status="PAPER_ONLY",
        mode="PAPER",
        daily_pnl=0.0,
        win_rate=0.0,
        profit_factor=0.0,
        max_drawdown=0.0,
        active_strategy="none",
        kill_switch=False,
    )
    return asdict(snapshot)
