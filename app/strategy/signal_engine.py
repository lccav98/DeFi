from dataclasses import dataclass

from app.strategy.indicators import ema, rsi
from app.strategy.regime_filter import volatility_regime


@dataclass
class Signal:
    ts: str
    strategy: str
    side: str
    quality_score: float


def generate_rsi_ema_signals(candles: list[dict]) -> list[Signal]:
    closes = [row["close"] for row in candles]
    fast = ema(closes, 9)
    slow = ema(closes, 21)
    mom = rsi(closes, 14)
    regime = volatility_regime(closes)

    signals: list[Signal] = []
    for i in range(30, len(candles)):
        if regime[i]:
            continue
        if fast[i] > slow[i] and mom[i] < 35:
            signals.append(Signal(ts=str(candles[i].get("ts", i)), strategy="rsi_ema_pa", side="CALL", quality_score=0.7))
        elif fast[i] < slow[i] and mom[i] > 65:
            signals.append(Signal(ts=str(candles[i].get("ts", i)), strategy="rsi_ema_pa", side="PUT", quality_score=0.7))
    return signals
