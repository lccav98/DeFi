def run_backtest(trades: list[dict]) -> dict:
    pnls = [t["pnl"] for t in trades]
    if not pnls:
        return {"net_pnl": 0.0, "win_rate": 0.0, "payoff": 0.0, "expectancy": 0.0, "profit_factor": 0.0, "max_drawdown": 0.0}
    net = sum(pnls)
    wins = [x for x in pnls if x > 0]
    losses = [x for x in pnls if x <= 0]
    win_rate = len(wins) / len(pnls)
    avg_win = sum(wins) / len(wins) if wins else 0
    avg_loss = abs(sum(losses) / len(losses)) if losses else 0
    payoff = (avg_win / avg_loss) if avg_loss else 0
    expectancy = net / len(pnls)
    pf = sum(wins) / max(abs(sum(losses)), 1e-9)

    equity = 0.0
    peak = 0.0
    max_dd = 0.0
    for p in pnls:
        equity += p
        peak = max(peak, equity)
        max_dd = max(max_dd, peak - equity)

    return {
        "net_pnl": float(net),
        "win_rate": float(win_rate),
        "payoff": float(payoff),
        "expectancy": float(expectancy),
        "profit_factor": float(pf),
        "max_drawdown": float(max_dd),
    }
