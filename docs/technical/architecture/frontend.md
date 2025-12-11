# Arquitetura do Frontend

## Tecnologias

- **Framework**: React 18
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **HTTP Client**: Axios
- **State**: React Context API

---

## Estrutura de Pastas

```
frontend/src/
├── components/
│   ├── auth/           # Login, Register
│   ├── common/         # Componentes reutilizáveis
│   ├── layout/         # Sidebar, Header
│   ├── modules/        # Módulos da aplicação
│   │   ├── GlobalDashboard.jsx
│   │   ├── ProjectsListView.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── ProjectCalendar.jsx
│   │   └── ...
│   └── ui/             # Buttons, Modals, Inputs
│
├── contexts/
│   ├── AuthContext.jsx
│   ├── AppContext.jsx
│   ├── NavigationContext.jsx
│   ├── ToastContext.jsx
│   └── ...
│
├── services/
│   ├── authService.js
│   ├── projectService.js
│   └── ...
│
├── config/
│   └── api.js          # Axios instance
│
└── App.jsx             # Entrada
```

---

## Contextos Principais

### AuthContext
Gerencia autenticação, token e logout.

```javascript
const { user, isAuthenticated, login, logout } = useAuthContext();
```

### AppContext
Dados globais como projetos, boards, usuários.

```javascript
const { projects, fetchProjects, companies } = useApp();
```

### NavigationContext
Navegação entre módulos sem roteador.

```javascript
const { activeModule, navigateTo, activeProjectId } = useNavigation();
```

### ToastContext
Notificações e confirmações customizadas.

```javascript
const { success, error, warning, confirm } = useToast();
```

---

## Design System

### Cores (Tailwind)
```css
primary-50  → primary-900  /* Azul/Indigo */
secondary-50 → secondary-900  /* Slate */
```

### Componentes UI
- `Button` - Botões com variantes
- `Modal` - Modals com overlay
- `Badge` - Tags coloridas
- `Input` - Campos estilizados

### Padrões Visuais
- **Cards**: `rounded-2xl`, `border`, `shadow-sm`
- **Gradientes**: `bg-gradient-to-r from-X to-Y`
- **Glassmorphism**: `bg-white/80 backdrop-blur-xl`

---

## Comunicação com API

### Configuração Axios

```javascript
// config/api.js
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Interceptor de auth
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Uso nos Services

```javascript
// services/projectService.js
export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};
```

---

## Fluxo de Renderização

```
App.jsx
  └── ThemeProvider
        └── AuthProvider
              └── ToastProvider
                    └── AppProvider
                          └── NavigationProvider
                                └── Layout
                                      ├── Sidebar
                                      └── MainContent
                                            └── [Active Module]
```

---

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview build
npm run preview
```

---

## Próximos Passos

- [Banco de Dados →](./database.md)
- [Deploy →](../deployment/vps-setup.md)
