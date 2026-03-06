from dataclasses import dataclass


@dataclass
class StakingPlan:
    mode: str
    fixed_amount: float = 1.0
    percent: float = 0.01

    def compute(self, balance: float) -> float:
        if self.mode == "fixed":
            return self.fixed_amount
        return balance * self.percent
