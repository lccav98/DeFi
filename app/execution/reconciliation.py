from dataclasses import dataclass


@dataclass
class ReconciliationRecord:
    order_id: str
    sent: bool
    accepted: bool
    executed: bool
    result: str


def reconcile(record: ReconciliationRecord) -> bool:
    return record.sent and record.accepted and record.executed
