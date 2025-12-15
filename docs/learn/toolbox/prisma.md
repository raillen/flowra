# O Poder do Prisma 💎

Falar com Banco de Dados costumava ser chato e difícil (SQL puro: `SELECT * FROM users WHERE...`).
O **Prisma** é nosso tradutor universal.

## O que é um ORM?
ORM significa *Object-Relational Mapping*.
Basicamente, ele transforma **Tabelas** do banco em **Objetos** do código.

## A Mágica do Auto-Complete ✨
Com o Prisma, quando você digita `prisma.user.`, o editor já sugere: `create`, `findMany`, `update`.
Você não precisa decorar os comandos!

## Migrations (A Máquina do Tempo)
Se quisermos adicionar um campo novo (tipo "Data de Nascimento") no usuário:
1.  Escrevemos no arquivo `schema.prisma`.
2.  Rodamos `npx prisma migrate dev`.
3.  Pronto! O Prisma altera o banco de dados sozinho, sem perder os dados que já estavam lá.

> **Resumo**: O Prisma nos dá segurança e velocidade para mexer nos dados.
