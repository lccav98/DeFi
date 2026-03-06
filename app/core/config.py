import os
from dataclasses import dataclass


@dataclass
class Settings:
    app_name: str = os.getenv("APP_NAME", "TRX Binary Quant Platform")
    environment: str = os.getenv("ENVIRONMENT", "local")
    enable_live: bool = os.getenv("ENABLE_LIVE", "false").lower() == "true"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./trxbinary.db")
    integration_mode: str = os.getenv("INTEGRATION_MODE", "PAPER_ONLY")
    trxbinary_api_key: str | None = os.getenv("TRXBINARY_API_KEY")
    trxbinary_api_secret: str | None = os.getenv("TRXBINARY_API_SECRET")


settings = Settings()
