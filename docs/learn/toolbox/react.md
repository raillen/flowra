# React: Construindo com LEGOs 🧱

> **Resumo (TL;DR)**: O React é uma biblioteca para criar interfaces de usuário dividindo tudo em pequenas peças independentes chamadas "Componentes".

---

## O Conceito de Componente

Imagine que você vai construir uma casa de LEGO. Você não derrete plástico para fazer uma parede inteira de uma vez. Você usa tijolos, janelas e portas pré-fabricadas.

No React, cada parte da tela é um componente:
- `<Botao />`
- `<Cabecalho />`
- `<CartaoDeUsuario />`

Exemplo simples:

```jsx
// Um componente é apenas uma função Javascript que retorna HTML (JSX)
function Botao({ texto, cor }) {
  return (
    <button className={`btn-${cor}`}>
      {texto}
    </button>
  );
}

// Usando o componente
function App() {
  return (
    <div>
       <Botao texto="Salvar" cor="azul" />
       <Botao texto="Cancelar" cor="vermelho" />
    </div>
  );
}
```

## JSX: HTML e JS Misturados

Você notou que escrevemos HTML dentro do Javascript? Isso é JSX.
Ele permite lógica poderosa direto no visual:

```jsx
function Saudacao({ usuario }) {
  // Lógica (Javascript)
  const hora = new Date().getHours();
  const bomDia = hora < 12;

  // Visual (JSX)
  return (
    <div>
      {/* Condicional Ternário: ? : */}
      <h1>{bomDia ? 'Bom dia' : 'Boa tarde'}, {usuario.nome}!</h1>
      
      {/* Listas Dinâmicas */}
      <ul>
        {usuario.tarefas.map(tarefa => (
           <li key={tarefa.id}>{tarefa.titulo}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Hooks: Os Superpoderes 🪝

Componentes funcionais seriam "burros" (apenas visuais) se não fossem os **Hooks**. Eles "engancham" poderes extras no componente.

### 1. `useState` (Memória)
Permite que o componente "lembre" de algo.

```javascript
import { useState } from 'react';

function Contador() {
  // [valorAtual, funcaoParaMudarValor] = useState(valorInicial)
  const [contagem, setContagem] = useState(0);

  return (
    <button onClick={() => setContagem(contagem + 1)}>
      Cliques: {contagem}
    </button>
  );
}
```

### 2. `useEffect` (Efeitos Colaterais)
Permite fazer coisas "fora" do componente (buscar dados, mudar título da página) quando algo muda.

```javascript
import { useEffect } from 'react';

function Perfil({ id }) {
  useEffect(() => {
    // Roda toda vez que o 'id' mudar
    document.title = `Perfil #${id}`;
    buscarDadosDoUsuario(id);
  }, [id]); // Array de dependências

  return <div>Vendo perfil {id}</div>;
}
```

### 3. `useContext` (Teletransporte de Dados)
Evita ter que passar dados de pai para filho, para neto, para bisneto... (`Prop Drilling`).
No Flowra, usamos isso para o `NavigationContext` e `AuthContext`. O dado fica disponível para qualquer componente dentro do "Provider".
