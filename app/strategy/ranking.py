def rank_strategies(metrics: list[dict]) -> list[dict]:
    scored = []
    for row in metrics:
        score = (
            row["profit_factor"] * 0.35
            + row["expectancy"] * 0.25
            + (1 - max(row["max_drawdown"], 0)) * 0.2
            + row["oos_stability"] * 0.15
            + (1 - row["parameter_sensitivity"]) * 0.05
        )
        scored.append({**row, "score": score})
    return sorted(scored, key=lambda x: x["score"], reverse=True)
