import sqlite3

from app.core.config import settings
from app.storage.models import SignalAudit


def _db_path() -> str:
    if settings.database_url.startswith("sqlite:///"):
        return settings.database_url.replace("sqlite:///", "")
    return "trxbinary.db"


def init_db() -> None:
    conn = sqlite3.connect(_db_path())
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS signal_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            strategy TEXT NOT NULL,
            side TEXT NOT NULL,
            quality_score REAL NOT NULL,
            is_live INTEGER NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def insert_signal(record: SignalAudit) -> None:
    conn = sqlite3.connect(_db_path())
    conn.execute(
        "INSERT INTO signal_audit(strategy, side, quality_score, is_live) VALUES (?, ?, ?, ?)",
        (record.strategy, record.side, record.quality_score, int(record.is_live)),
    )
    conn.commit()
    conn.close()
