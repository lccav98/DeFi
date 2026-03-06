def stake_fixed(amount: float) -> float:
    return max(amount, 0.0)


def stake_percent(balance: float, pct: float) -> float:
    return max(balance * pct, 0.0)
