# Arquitetura

## Princípios
- Segurança e conformidade primeiro.
- `PAPER_ONLY` por padrão até confirmação oficial.
- Separação clara entre sinal, risco, execução e auditoria.

## Fluxo
1. `integration_audit` determina capacidade oficial.
2. Estratégias geram sinais com score de qualidade.
3. Camada de risco filtra e pode acionar kill switch.
4. Execução decide entre paper/live segundo políticas.
5. Reconciliation persiste trilha de auditoria.

## Branches de execução
- **LIVE_API**: somente via `official_api_client` documentado.
- **LIVE_COPYTRADE**: somente via `official_copytrade_client` oficial.
- **PAPER_ONLY**: sinais, alertas e paper trading; sem ordens reais.
