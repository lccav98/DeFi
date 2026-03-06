# Checklist de Segurança

- [x] Modo padrão `PAPER_ONLY`.
- [x] `ENABLE_LIVE=false` por padrão.
- [x] Bloqueio de execução real sem integração oficial confirmada.
- [x] Sem automação por clique em UI.
- [x] Sem bypass de captcha/2FA/WAF/rate-limit.
- [x] Kill switch manual e automático.
- [x] Trilha de auditoria de sinais e reconciliação.
- [ ] Rotação de credenciais oficiais em produção.
- [ ] Cofre de segredos (ex: Vault) em ambiente real.
