# TRX Binary Quant Platform (Safety-First)

Plataforma inicial para pesquisa quantitativa, backtests, paper trading e integração **somente oficial** quando comprovada.

## Conclusão atual da auditoria
**não confirmado — sistema limitado a paper trading e alertas**.

## Estrutura
```
/app
  /api
  /core
  /brokers/trxbinary
  /strategy
  /risk
  /execution
  /backtest
  /storage
  /ui
/tests
/docs
/docker
/reports
```

## Regras de segurança implementadas
- Sem automação de cliques em UI para compra/venda.
- Sem bypass de captcha/2FA/WAF/rate-limit.
- Sem uso de endpoints privados não documentados.
- LIVE bloqueado por padrão (`ENABLE_LIVE=false`).
- LIVE só permitido com recomendação `LIVE_API` ou `LIVE_COPYTRADE` + credenciais oficiais.

## Rodando localmente
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
pytest
python -m app.brokers.trxbinary
uvicorn app.api.main:app --reload
```

## Pipeline quantitativo
1. Catálogo de estratégias candidatas.
2. Backtest vetorizado e métricas (expectancy, PF, drawdown, win rate, payoff).
3. Walk-forward e Monte Carlo para robustez.
4. Ranking e aprovação com critérios mínimos.
5. Deploy somente se sem overfitting e dentro dos limites de risco.

## Entregáveis da Fase 1
- `reports/integration_audit.md`
- `reports/integration_audit.json`

## Plano de evolução
1. Implementar conectores oficiais após evidência documental formal.
2. Acrescentar ingestão de candles oficial e calendário de notícias permitido.
3. Expandir dashboard com equity curve, heatmap de sensibilidade e alertas.
4. Integrar notificações (Telegram/email/webhook local).
5. Endurecer segurança operacional (segredos, rotação de chaves, trilha de auditoria completa).
