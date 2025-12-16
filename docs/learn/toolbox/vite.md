# Vite: O Motor de Fórmula 1 do Frontend 🏎️

> **Resumo (TL;DR)**: O Vite ("rápido" em francês) é a ferramenta que usamos para rodar o site enquanto programamos. Ele carrega as mudanças instantaneamente (HMR) e empacota tudo para produção de forma super otimizada.

---

## O Problema dos Antigos "Bundlers"

Imagine que você está escrevendo um livro (seu código). Antigamente (com Webpack), toda vez que você corrigia uma vírgula no capítulo 1, a editora tinha que re-imprimir o livro inteiro para você ver como ficou. Isso demorava segundos, às vezes minutos!

## Como o Vite Funciona?

O Vite é mais esperto. Ele divide seu código em duas partes:

1.  **Dependências (O que muda pouco)**: Bibliotecas como React, Axios. Ele pré-processa isso uma vez e deixa pronto (usando **esbuild**, escrito em Go, que é 100x mais rápido que JS).
2.  **Seu Código (O que muda sempre)**: Ele serve os arquivos direto para o navegador usando módulos ES nativos (`import`/`export`).

Quando você edita um arquivo, o Vite só "troca a página" que você mexeu. Isso se chama **HMR (Hot Module Replacement)**.

## Estrutura no Flowra

No arquivo `vite.config.js`, controlamos o motor:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()], // Plugin para entender JSX/React
  resolve: {
    alias: {
      // Atalho: '@' vira 'src'
      // import Button from '@/components/Button' 
      // em vez de '../../components/Button'
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // Porta padrão de desenvolvimento
    host: true  // Permite acesso pela rede local
  }
})
```

## Build para Produção (`npm run build`)

Quando vamos para produção, não queremos um monte de arquivos soltos. O Vite usa o **Rollup** por baixo dos panos para:
1.  Juntar todos os seus `.js` e `.css`.
2.  Remover código que não é usado (**Tree Shaking** 🌳).
3.  Minificar (deixar o código ilegível para humanos, mas minúsculo para máquinas).

O resultado vai para a pasta `dist/`, que é exatamente o que o **Nginx** serve!
