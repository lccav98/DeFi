from dataclasses import dataclass


@dataclass
class PaperExecutor:
    balance: float = 1000.0

    def execute(self, side: str, amount: float, price: float) -> dict:
        self.balance -= amount
        return {"mode": "paper", "side": side, "amount": amount, "price": price, "status": "filled"}
