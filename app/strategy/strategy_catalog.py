from dataclasses import dataclass


@dataclass
class StrategyDefinition:
    name: str
    timeframe: str
    entry_rule: str
    no_entry_rule: str
    session_window: str
    supports_volume: bool


def load_catalog() -> list[StrategyDefinition]:
    return [
        StrategyDefinition("trend_vol_filter", "M1-M5", "EMA cross + vol filter", "high volatility", "00:00-23:59", False),
        StrategyDefinition("range_breakout", "M1-M5", "range break confirmation", "inside noisy range", "00:00-23:59", False),
        StrategyDefinition("mean_reversion_regime", "M1-M5", "zscore + regime", "trending regime", "00:00-23:59", False),
        StrategyDefinition("rsi_ema_pa", "M1-M5", "RSI+EMA+price action", "conflicting indicators", "00:00-23:59", False),
        StrategyDefinition("volume_momentum", "M1-M5", "momentum + volume", "volume unavailable", "00:00-23:59", True),
    ]
