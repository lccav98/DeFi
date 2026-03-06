from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from app.brokers.trxbinary.capability_matrix import IntegrationRecommendation


@dataclass
class EvidenceItem:
    source: str
    url: str
    finding: str


@dataclass
class IntegrationAuditResult:
    timestamp_utc: str
    official_api: str
    official_copy_trading: str
    third_party_order_automation_allowed: str
    activation_notes: list[str]
    permissions: list[str]
    limitations: list[str]
    evidences: list[EvidenceItem]
    recommendation: IntegrationRecommendation

    def to_dict(self) -> dict:
        data = asdict(self)
        data["recommendation"] = self.recommendation.value
        return data


@dataclass
class IntegrationAuditService:
    output_dir: Path = Path("reports")

    def run_offline_audit(self) -> IntegrationAuditResult:
        return IntegrationAuditResult(
            timestamp_utc=datetime.now(timezone.utc).isoformat(),
            official_api="não confirmado",
            official_copy_trading="não confirmado",
            third_party_order_automation_allowed="não confirmado",
            activation_notes=[
                "Validar em páginas oficiais: termos, FAQ, central de ajuda e portal de desenvolvedor.",
                "Requer confirmação explícita da plataforma antes de ENABLE_LIVE=true.",
            ],
            permissions=["Sem permissões verificadas de integração oficial neste ambiente offline."],
            limitations=[
                "Sem confirmação de API oficial pública para envio de ordens.",
                "Sem confirmação de copy trading oficial habilitável para terceiros.",
            ],
            evidences=[
                EvidenceItem(
                    source="TRX Binary landing",
                    url="https://app.trxbinary.com/cgi-sys/defaultwebpage.cgi",
                    finding="Página inicial genérica sem documentação pública de integração nesta auditoria offline.",
                )
            ],
            recommendation=IntegrationRecommendation.PAPER_ONLY,
        )

    def write_reports(self) -> tuple[Path, Path]:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        result = self.run_offline_audit()
        md_path = self.output_dir / "integration_audit.md"
        json_path = self.output_dir / "integration_audit.json"
        md_path.write_text(self._to_markdown(result), encoding="utf-8")
        json_path.write_text(json.dumps(result.to_dict(), indent=2, ensure_ascii=False), encoding="utf-8")
        return md_path, json_path

    @staticmethod
    def _to_markdown(result: IntegrationAuditResult) -> str:
        evidences = "\n".join([f"- **{e.source}**: {e.url} → {e.finding}" for e in result.evidences])
        return f"""# Integration Audit — TRX Binary

- **timestamp_utc:** {result.timestamp_utc}
- **existe API oficial?** {result.official_api}
- **existe copy trading oficial?** {result.official_copy_trading}
- **automação de ordens por terceiros permitida?** {result.third_party_order_automation_allowed}
- **recomendação final:** {result.recommendation.value}

## Como ativar/configurar
{chr(10).join([f'- {i}' for i in result.activation_notes])}

## Permissões
{chr(10).join([f'- {i}' for i in result.permissions])}

## Limitações
{chr(10).join([f'- {i}' for i in result.limitations])}

## Evidências
{evidences}
"""
