def volatility_regime(prices: list[float], window: int = 20, threshold: float = 0.01) -> list[bool]:
    if len(prices) < 2:
        return [False] * len(prices)
    returns = [0.0] + [(prices[i] / prices[i - 1] - 1) if prices[i - 1] else 0.0 for i in range(1, len(prices))]
    out = []
    for i in range(len(returns)):
        chunk = returns[max(0, i - window + 1): i + 1]
        mean = sum(chunk) / max(len(chunk), 1)
        var = sum((x - mean) ** 2 for x in chunk) / max(len(chunk), 1)
        out.append(var**0.5 > threshold)
    return out
