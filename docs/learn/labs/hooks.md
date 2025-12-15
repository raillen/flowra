# Lab: Hooks Explicados 🪝

"Hooks" são ganchos que permitem ao código "se pendurar" em funcionalidades do React.

## 1. `useState` (A Memória) 🧠
O componente precisa lembrar de coisas.
*   Exemplo: "O menu está aberto ou fechado?"

```javascript
const [isOpen, setIsOpen] = useState(false);
```
*   `isOpen`: É o valor atual (Falso/Fechado).
*   `setIsOpen`: É a função para mudar o valor (como um interruptor).

## 2. `useEffect` (O Efeito Colateral) ⚡
Diz ao React para fazer algo **depois** de pintar a tela.
*   Exemplo: "Assim que a tela carregar, busque os dados na API."

```javascript
useEffect(() => {
  api.get('/cards');
}, []); 
// ^ Esse array vazio [] significa "Só faça isso no Nascimento (Mount)"
```

## 3. `useContext` (O Telefone Sem Fio) 📞
Permite passar dados para componentes filhos sem precisar passar de mão em mão (props).
*   Usamos isso para saber quem é o **Usuário Logado** em qualquer lugar do app.
