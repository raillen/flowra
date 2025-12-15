# Lab: Ciclo de Vida do React ♻️

Os componentes do React (botões, janelas, cards) têm vida! Eles nascem, mudam e morrem.

## 1. Nascimento (Mount) 👶
É quando o componente aparece na tela pela primeira vez.
*   O React "pinta" o HTML na tela.
*   É aqui que buscamos dados no servidor (ex: carregar a lista de cards).

## 2. Crescimento/Mudança (Update) 🧑‍🦱
É quando algo muda.
*   O usuário clicou num botão?
*   Chegou uma mensagem nova no chat?
*   O React percebe a mudança e "re-pinta" apenas o pedacinho que mudou. Isso é o que faz ele ser tão rápido!

## 3. Morte (Unmount) 💀
É quando o componente sai da tela.
*   Você mudou de página? Fechou um modal?
*   O React limpa a memória para o computador não ficar lento.

> **Importante**: Entender isso ajuda a evitar bugs onde tentamos atualizar um componente que "já morreu".
