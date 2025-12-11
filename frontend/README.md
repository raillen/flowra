# KBSys Frontend

Sistema de gestão de projetos - Frontend React

## 🚀 Tecnologias

- **React** 18+
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Lucide React** - Icons
- **Zod** - Validation

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes UI básicos
│   │   ├── layout/       # Componentes de layout
│   │   ├── modules/      # Módulos da aplicação
│   │   └── common/       # Componentes comuns
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Hooks customizados
│   ├── services/         # Serviços de API
│   ├── utils/            # Utilitários
│   ├── config/            # Configurações
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Entry point
├── public/                # Arquivos estáticos
└── index.html            # HTML principal
```

## 🔧 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Executa ESLint
- `npm run lint:fix` - Corrige erros do ESLint
- `npm run format` - Formata código com Prettier

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📚 Documentação

Para mais informações, consulte a documentação do backend em `../docs/backend-development-guide.md`.

