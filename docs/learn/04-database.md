# O Banco de Dados 🗄️

O Banco de Dados é a memória do nosso sistema. Sem ele, se desligássemos o computador, perderíamos tudo!

## Como organizamos as coisas?
Usamos algo chamado **Modelo Relacional**. Imagine várias planilhas do Excel que se conversam.

### As Principais "Planilhas" (Tabelas)

1.  **Users (Usuários)** 👤
    *   `id`: O número da identidade do usuário.
    *   `email`: O e-mail (login).
    *   `password`: A senha (secreta!).

2.  **Boards (Quadros)** 📋
    *   `id`: Identidade do quadro.
    *   `name`: Nome do quadro (ex: "Marketing").
    *   `projectId`: A qual projeto ele pertence?

3.  **Cards (Tarefas)** 📝
    *   `id`: Identidade da tarefa.
    *   `title`: O que tem que fazer?
    *   `status`: Está pronto?
    *   `boardId`: Em qual quadro ela está?

## O Prisma 💎
Para mexer no banco de dados, usamos uma ferramenta chamada **Prisma**.
O Prisma é como um tradutor. Nós falamos com ele em Javascript ("Prisma, crie um usuário!"), e ele fala com o banco de dados na língua dele (SQL).

> **Exemplo de código**:
> ```javascript
> // Criando um usuário
> await prisma.user.create({
>   data: {
>     name: "João",
>     email: "joao@email.com"
>   }
> })
> ```
> Viu como é fácil de ler? 😊
