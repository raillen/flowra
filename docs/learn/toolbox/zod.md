# Segurança com Zod 🛡️

O **Zod** é o segurança da balada. Ninguém entra sem ser revistado.

## O Problema
O usuário pode mandar qualquer coisa para o servidor.
*   No campo "Idade", ele manda "Batata".
*   No campo "Email", ele manda um vírus.

Se não checarmos, o sistema quebra.

## A Solução: Zod
O Zod cria "schemas" (moldes) de validação.

```javascript
const UserSchema = z.object({
  username: z.string().min(3), // Tem que ser texto, mínimo 3 letras
  age: z.number().min(18),     // Tem que ser número, maior de 18
  email: z.string().email()    // Tem que ter cara de email
});
```

Se o dado não encaixar no molde, o Zod barra na hora e devolve um erro bonito.

> **Resumo**: O Zod garante que só dados limpos e corretos entrem no nosso sistema.
