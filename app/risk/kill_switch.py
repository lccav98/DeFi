from dataclasses import dataclass


@dataclass
class KillSwitch:
    manual_triggered: bool = False
    auto_triggered: bool = False

    @property
    def is_active(self) -> bool:
        return self.manual_triggered or self.auto_triggered

    def trigger_manual(self) -> None:
        self.manual_triggered = True

    def trigger_auto(self) -> None:
        self.auto_triggered = True
