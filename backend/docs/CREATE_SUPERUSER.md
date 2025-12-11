# Criar Superuser/Admin

Este guia explica como criar um usuário administrador (superuser) no sistema.

## 🚀 Métodos

### 1. Modo Interativo (Recomendado)

Execute o script sem argumentos e preencha os dados quando solicitado:

```bash
npm run create-superuser
```

O script irá pedir:
- **Email**: Email do administrador
- **Nome**: Nome completo
- **Senha**: Senha (mínimo 6 caracteres)
- **Confirmar senha**: Confirmação da senha
- **Role**: Tipo de usuário (admin/superuser/user) - padrão: admin

### 2. Modo com Argumentos

Crie o superuser diretamente via linha de comando:

```bash
node scripts/create-superuser.js --email admin@example.com --name "Administrador" --password "senha123" --role admin
```

**Parâmetros:**
- `--email`: Email do usuário (obrigatório)
- `--name`: Nome completo (obrigatório)
- `--password`: Senha (obrigatório, mínimo 6 caracteres)
- `--role`: Role do usuário (opcional, padrão: "admin")

**Exemplos:**

```bash
# Criar admin padrão
node scripts/create-superuser.js --email admin@kbsys.com --name "Admin" --password "admin123"

# Criar superuser
node scripts/create-superuser.js --email superuser@kbsys.com --name "Super User" --password "super123" --role superuser

# Criar usuário comum (não recomendado via este script)
node scripts/create-superuser.js --email user@kbsys.com --name "User" --password "user123" --role user
```

## 🔐 Credenciais Padrão de Teste

Após executar o script, você terá um usuário criado. Exemplo:

```
Email: admin@kbsys.com
Senha: admin123
Role: admin
```

## ⚠️ Importante

1. **Segurança**: Em produção, use senhas fortes e únicas
2. **Email único**: Cada email só pode ser usado uma vez
3. **Atualização**: Se o email já existir, o script atualizará o usuário para o role especificado
4. **Senha**: A senha é criptografada usando bcrypt antes de ser salva

## 🔄 Atualizar Usuário Existente

Se você executar o script com um email que já existe, o usuário será atualizado:
- Nome será atualizado
- Senha será atualizada (nova hash)
- Role será atualizado

## 📝 Roles Disponíveis

- **admin**: Administrador com acesso completo
- **superuser**: Super usuário (mesmo que admin)
- **user**: Usuário comum (padrão para novos registros)

## 🧪 Testar Login

Após criar o superuser, você pode testar o login:

```bash
# Via curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kbsys.com",
    "password": "admin123"
  }'
```

Ou use o frontend em `http://localhost:5173` e faça login com as credenciais criadas.

## 🐛 Troubleshooting

### Erro: "Email inválido"
- Verifique o formato do email (deve ter @ e domínio)

### Erro: "Senha deve ter no mínimo 6 caracteres"
- Use uma senha com pelo menos 6 caracteres

### Erro: "User already exists"
- O script atualizará o usuário existente automaticamente
- Se quiser criar outro, use um email diferente

### Erro de conexão com banco
- Verifique se o banco está rodando
- Verifique o `DATABASE_URL` no `.env`
- Execute `npm run migrate` se necessário

