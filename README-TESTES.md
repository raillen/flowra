# Testes com Playwright - KBSys

Este projeto contém testes E2E e de API usando Playwright para o sistema KBSys.

## 📋 Estrutura de Testes

```
tests/
├── frontend/
│   ├── auth.spec.js          # Testes de autenticação
│   ├── navigation.spec.js     # Testes de navegação
│   └── components.spec.js     # Testes de componentes
├── backend/
│   ├── api-auth.spec.js       # Testes de API de autenticação
│   ├── api-projects.spec.js   # Testes de API de projetos
│   ├── api-companies.spec.js  # Testes de API de empresas
│   └── api-cors.spec.js       # Testes de CORS e segurança
└── utils/
    └── test-reporter.js       # Utilitário para capturar erros/warnings
```

## 🚀 Instalação

1. Instalar dependências:
```bash
npm install
```

2. Instalar navegadores do Playwright:
```bash
npx playwright install
```

## 🧪 Executar Testes

### Todos os testes
```bash
npm test
```

**Nota:** Se os servidores (backend e frontend) já estiverem rodando, o Playwright irá reutilizá-los automaticamente. Se você quiser garantir que os servidores não sejam iniciados pelo Playwright, use:

```bash
npm run test:skip-server
```

### Testes do frontend apenas
```bash
npm run test:frontend
```

### Testes do backend apenas
```bash
npm run test:backend
```

### Testes com interface gráfica
```bash
npm run test:ui
```

### Testes em modo debug
```bash
npm run test:debug
```

### Testes com navegador visível
```bash
npm run test:headed
```

### Gerar relatório completo
```bash
npm run test:all
```

## 📊 Relatórios

Após executar os testes, os relatórios são salvos em `test-results/`:

- **final-report.json** - Relatório completo em JSON
- **final-report.txt** - Relatório em texto simples
- **final-report.md** - Relatório em Markdown
- **test-report.json** - Relatório de erros/warnings
- **test-report.md** - Relatório de erros/warnings em Markdown
- **results.json** - Resultados do Playwright
- **playwright-report/** - Relatório HTML interativo

Para visualizar o relatório HTML:
```bash
npm run test:report
```

## 🔍 O que os testes verificam

### Frontend
- ✅ Autenticação e login
- ✅ Navegação entre páginas
- ✅ Componentes da interface
- ✅ Validação de formulários
- ✅ Acessibilidade básica
- ✅ Responsividade
- ✅ Performance básica

### Backend
- ✅ Endpoints de autenticação
- ✅ Validação de dados
- ✅ Proteção de rotas
- ✅ CORS e segurança
- ✅ Health check

## ⚠️ Erros e Warnings

O sistema captura automaticamente:
- Erros do console do navegador
- Erros de rede (requests falhados)
- Erros de JavaScript na página
- Warnings de acessibilidade
- Warnings de performance
- Problemas de validação

Todos os erros e warnings são salvos em `test-results/test-report.json` e `test-results/test-report.md` para análise posterior.

## 🔧 Configuração

As configurações podem ser ajustadas em `playwright.config.js`:

- **baseURL**: URL base do frontend (padrão: http://localhost:5173)
- **API_URL**: URL da API (padrão: http://localhost:3000/api)
- **Browsers**: Chromium, Firefox, WebKit

Variáveis de ambiente:
- `FRONTEND_URL` - URL do frontend
- `API_URL` - URL da API
- `CI` - Modo CI (reduz workers e adiciona retries)

## 📝 Notas

- Os testes assumem que o backend está rodando na porta 3000
- Os testes assumem que o frontend está rodando na porta 5173
- Os servidores são iniciados automaticamente pelo Playwright se não estiverem rodando
- Alguns testes podem falhar se não houver dados de teste no banco

## 🐛 Troubleshooting

### Erro: "port is already used"
Se você receber um erro dizendo que a porta já está em uso, isso significa que os servidores já estão rodando. O Playwright está configurado para reutilizar servidores existentes automaticamente. Se o erro persistir:

1. **Opção 1:** Pare os servidores manualmente e deixe o Playwright iniciá-los:
   ```bash
   # Pare os servidores manualmente (Ctrl+C nos terminais onde estão rodando)
   npm test
   ```

2. **Opção 2:** Use o modo que ignora o webServer:
   ```bash
   npm run test:skip-server
   ```

3. **Opção 3:** Verifique se os servidores estão realmente rodando:
   ```bash
   # Backend
   curl http://localhost:3000/health
   
   # Frontend
   curl http://localhost:5173
   ```

### Servidores não iniciam
Certifique-se de que as portas 3000 e 5173 estão livres, ou ajuste as configurações.

### Testes falham por timeout
Aumente o timeout no `playwright.config.js` ou verifique se os servidores estão respondendo.

### Erros de conexão
Verifique se o backend e frontend estão configurados corretamente e se as variáveis de ambiente estão definidas.

