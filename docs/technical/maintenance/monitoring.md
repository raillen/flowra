# Monitoramento e Logs 📊

Como saber se o sistema está saudável?

## Logs de Aplicação
O backend emite logs estruturados. Em produção, recomenda-se usar algo como PM2 ou serviços de log (Datadog, CloudWatch).

## Métricas Chave
*   **Uptime**: O sistema está no ar?
*   **Latência**: Tempo de resposta da API (ideal < 200ms).
*   **Erros 500**: Taxa de falhas do servidor.

## Health Check
O endpoint `GET /api/health` retorna `{ status: 'ok' }` e deve ser monitorado por um load balancer.
