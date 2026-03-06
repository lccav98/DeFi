def walk_forward_score(metrics: list[dict], train_col: str = "train_pf", test_col: str = "test_pf") -> float:
    if not metrics:
        return 0.0
    stable = sum(1 for row in metrics if row[test_col] > 1.0) / len(metrics)
    drift = sum(abs(row[train_col] - row[test_col]) for row in metrics) / len(metrics)
    return float(max(stable - drift * 0.1, 0.0))
