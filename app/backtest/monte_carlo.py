import random


def monte_carlo_drawdown(pnl: list[float], simulations: int = 200) -> float:
    if not pnl:
        return 0.0
    max_dds = []
    for _ in range(simulations):
        shuffled = pnl[:]
        random.shuffle(shuffled)
        equity, peak, max_dd = 0.0, 0.0, 0.0
        for item in shuffled:
            equity += item
            peak = max(peak, equity)
            max_dd = max(max_dd, peak - equity)
        max_dds.append(max_dd)
    max_dds.sort()
    idx = min(int(0.95 * (len(max_dds) - 1)), len(max_dds) - 1)
    return float(max_dds[idx])
