# Módulo de Automação 🤖

Esta é uma das partes mais legais do sistema!

## O que é?
É um sistema "Se -> Então".
*   **SE** acontecer X...
*   **ENTÃO** faça Y.

Exemplo: **SE** mover card para "Concluído", **ENTÃO** arquive o card.

## Como construímos isso? (Passo a Passo)

### 1. O Modelo (A Planta)
Primeiro, definimos como salvar uma regra no banco.
Precisávamos guardar:
*   O Gatilho (`trigger`): O que dispara a regra?
*   A Condição (`condition`): Onde tem que acontecer?
*   A Ação (`action`): O que fazer?

### 2. O Controlador (O Cérebro)
Criamos um arquivo `automation.controller.js`.
Ele recebe o aviso "Ei, um card se moveu!".
Ele verifica: "Tem alguma regra para card movido?".
Se tiver, ele executa!

### 3. A Integração (O Elo)
No Frontend, criamos o **Modal de Configurações**.
Lá você pode clicar e criar suas regras.

> **Desafio Superado**:
> No começo, os testes falhavam porque o botão "Criar" demorava para aparecer.
> **Solução**: Ajustamos o código para esperar tudo carregar antes de clicar. Paciência é uma virtude, até para robôs! 🧘
