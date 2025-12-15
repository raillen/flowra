# Git sem Medo 🌳

O Git é nossa máquina do tempo. Ele salva o histórico de tudo.

## Comandos Mágicos

### `git status` 🔍
"O que eu mudei?"
Mostra arquivos modificados em vermelho.

### `git add .` ➕
"Vou incluir tudo isso no pacote."
Prepara os arquivos para serem salvos.

### `git commit -m "mensagem"` 💾
"Salvar pacote!"
Cria um ponto na história.
> **Dica**: Escreva mensagens claras. "Fix bug" não ajuda. "Corrigido erro de login na home" ajuda!

### `git push` 🚀
"Enviar para a nuvem."
Manda seu código para o GitHub/GitLab.

## Conflitos (O Pesadelo) ⚔️
Acontece quando duas pessoas mexem na mesma linha do mesmo arquivo.
O Git vai gritar. Não entre em pânico!
1.  Abra o arquivo.
2.  Você vai ver `<<<<<<< HEAD` (O seu) e `>>>>>>>` (O do outro).
3.  Apague as linhas estranhas e escolha o código certo.
4.  Salve e faça commit de novo.
