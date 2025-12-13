Aqui está uma separação clara e direta — **o que você implementa durante o desenvolvimento** e **o que você implementa no deploy/produção** — baseada na sua stack (React, Node.js + Fastify, PostgreSQL, Prisma, Redis, S3, Docker).

A divisão leva em conta práticas que só fazem sentido quando o sistema está rodando publicamente, e práticas que devem ser embutidas no próprio código desde o primeiro dia.

---

# **1 — O que implementar durante o desenvolvimento (DEV)**

*Práticas que devem existir dentro do código, na arquitetura, nos testes e no fluxo de desenvolvimento.*

### **1.1. Segurança no código e validação**

* Validação de entrada com Zod/Joi em todos os endpoints.
* Sanitização de HTML/Markdown no backend.
* Escapamento automático no React (evitar dangerouslySetInnerHTML).
* Nunca colocar segredos no código (.env não versionado).
* Nunca expor API keys no frontend.
* Uso de ORM seguro (Prisma) com queries parametrizadas.
* Criação de roles e permissões (RBAC) desde o início.
* Autorização robusta (verificação de company_id, ownership, membership).
* Tokens JWT bem construídos (claims mínimos).
* Rotina de logout + invalidation list para tokens.
* Rate limit embutido no fastify.
* Schema de auditoria no banco (logs de ações importantes).

### **1.2. Lógica de autenticação**

* Uso de cookies httpOnly/SameSite para access/refresh tokens.
* Implementação de token rotation no backend.
* Implementação de gerenciamento de sessão no Redis.

### **1.3. Proteções de segurança do frontend**

* Configuração inicial de CSP em modo **report-only** (para testes).
* Configuração de medidas anti-XSS no React.
* Evitar armazenar tokens no localStorage.

### **1.4. Estrutura de logs**

* Redação automática de dados sensíveis (authorization, senha, token).
* Logs estruturados desde o início.

### **1.5. Uploads**

* Validação de extensão, MIME e tamanho no backend.
* Rotina para gerar URLs presignadas.
* Sanitização dos nomes dos arquivos.

### **1.6. Banco de dados**

* Definir early as roles mínimas (aplicação não é superuser).
* Criar migratons com índices e constraints seguras.
* Implementar bucket/tenant isolation via `company_id`.
* Preparar a base para Row-Level Security (opcional, mas possível no DEV).

### **1.7. Ferramentas de segurança no ambiente DEV**

* Dependabot/Renovate ativado.
* Scans de CVE na pipeline de CI.
* Pre-commit hooks (lint + secret scanner).

### **1.8. Containers**

* Dockerfile seguro desde o desenvolvimento (usuário não root, imagem pequena).
* Política de não colocar segredos no `docker-compose.yml`.

---

# **2 — O que implementar exclusivamente no deploy / produção (DEPLOY)**

*Práticas que envolvem infraestrutura, rede, balanceadores, criptografia avançada e hardening final.*

### **2.1. TLS e rede**

* Configurar HTTPS real com certificados válidos.
* Habilitar HSTS (Strict-Transport-Security).
* Desabilitar TLS < 1.2.
* Configurar nginx/traefik para:

  * remover headers inseguros
  * adicionar security headers
  * bloquear origens não autorizadas

### **2.2. Hardening de servidores e containers**

* Usar containers com rootless mode.
* Ativar read-only filesystem nos containers.
* Ativar AppArmor/SELinux nos hosts quando possível.
* Limitar CPU/RAM no Kubernetes/Docker Compose.
* Configurar logs para armazenamento externo (ELK, Loki).

### **2.3. Banco de dados (produção)**

* Criptografia de disco (at-rest) no host ou banco gerenciado.
* Ativar SSL/TLS na conexão DB-prod.
* Implementar RLS apenas quando garantido que não quebra o funcionamento.
* Backups criptografados + retenção.

### **2.4. Secrets management**

* Usar **Vault**, **AWS Secrets Manager**, **GCP Secret Manager**, ou variáveis seguras no ambiente.
* Rotação automática de secrets.
* Nunca montar `.env` diretamente — usar injeção de secrets.

### **2.5. Proteções de API públicas**

* Rate limiting agressivo por IP e user.
* Firewall ou WAF (Cloudflare / AWS WAF).
* Proteção contra brute-force: captcha + bloqueio temporário.

### **2.6. S3**

* Buckets privados.
* Política IAM específica para o serviço (least privilege).
* Rotação periódica das chaves IAM.

### **2.7. Monitoramento e detecção**

* Alertas de:

  * picos de latência
  * picos de erros 500
  * falhas de login
  * tentativas de invasão
* Integração com Sentry, Prometheus, Grafana, Loki.

### **2.8. Segurança Web**

* CSP **enforcement mode** (não apenas report-only).
* X-Frame-Options.
* X-Content-Type-Options.
* Referrer-Policy.
* Subresource Integrity (SRI).
* Proteção de iFrames e embeds.

### **2.9. Auditoria e compliance**

* Logs armazenados externamente.
* Logs imutáveis para auditoria.
* Retenção definida (90/180/365 dias).

### **2.10. Websocket / Real-time**

* Autenticação no handshake.
* Rate limit para mensagens.
* Origem verificada.

### **2.11. Testes de segurança**

* Rodar OWASP ZAP DAST contra a aplicação em staging/produção.
* Configurar scanners como Snyk, SonarQube, Semgrep.
* Pentest manual antes de liberar versão empresarial.

---

# **Resumo rápido / prática**

Aqui vai um quadro final que te dá um panorama direto:

| Área                    | DEV        | DEPLOY                        |
| ----------------------- | ---------- | ----------------------------- |
| Validação / Sanitização | ✔️         | —                             |
| Tokens / Sessões        | ✔️         | —                             |
| Segurança de headers    | —          | ✔️                            |
| TLS / HTTPS             | —          | ✔️                            |
| RBAC / permissões       | ✔️         | —                             |
| Rate limit básico       | ✔️         | ✔️ (mais agressivo)           |
| S3 presigned URLs       | ✔️         | ✔️                            |
| Hardening de containers | parcial    | ✔️                            |
| Secrets (.env)          | ✔️ (local) | ✔️ (Vault/SecretManager)      |
| Logs redaction          | ✔️         | ✔️                            |
| Auditoria DB            | ✔️         | ✔️                            |
| Backups criptografados  | —          | ✔️                            |
| Firewall / WAF          | —          | ✔️                            |
| CSP report-only         | ✔️         | —                             |
| CSP enforce             | —          | ✔️                            |
| Monitoramento / Alertas | —          | ✔️                            |
| Pentests                | —          | ✔️                            |
| RLS PostgreSQL          | opcional   | recomendado para multiempresa |

---

# **Se quiser, posso te gerar agora:**

* Um **checklist completo** (pronto para colar no Notion/Jira).
* Uma **pipeline CI/CD** com etapas de segurança recomendadas.
* Um **guia prático para Docker e Nginx com hardening**.
* Uma **matriz de responsabilidades (RACI)** para sua equipe.

Qual desses você quer que eu produza agora?
