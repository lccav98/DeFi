def ema(values: list[float], span: int) -> list[float]:
    if not values:
        return []
    alpha = 2 / (span + 1)
    out = [values[0]]
    for value in values[1:]:
        out.append(alpha * value + (1 - alpha) * out[-1])
    return out


def rsi(values: list[float], period: int = 14) -> list[float]:
    if len(values) <= period:
        return [50.0] * len(values)
    deltas = [values[i] - values[i - 1] for i in range(1, len(values))]
    rsis = [50.0]
    for i in range(1, len(values)):
        window = deltas[max(0, i - period):i]
        gains = sum(x for x in window if x > 0) / max(len(window), 1)
        losses = -sum(x for x in window if x < 0) / max(len(window), 1)
        if losses == 0:
            rsis.append(100.0)
            continue
        rs = gains / losses
        rsis.append(100 - (100 / (1 + rs)))
    return rsis
