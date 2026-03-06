from app.backtest.engine import run_backtest


def test_backtest_returns_expected_keys():
    trades = [{"pnl": 1.0}, {"pnl": -0.5}, {"pnl": 1.2}, {"pnl": -0.2}]
    metrics = run_backtest(trades)
    for key in ["net_pnl", "win_rate", "payoff", "expectancy", "profit_factor", "max_drawdown"]:
        assert key in metrics
