# 🌸 CuteKass

> Gerenciador de contas de League of Legends feito com carinho — organize, importe, exporte e logue com um clique.

![versão](https://img.shields.io/github/v/release/yannevic/cutekass?label=versão&color=7B2CF5)
![plataforma](https://img.shields.io/badge/plataforma-Windows-CFA6FF?logo=windows)
![licença](https://img.shields.io/badge/licença-privado-D94BFF)

---

## ✨ Funcionalidades

- 🗂️ **Organização em pastas** — crie pastas com ícone, cor e nome personalizados, arraste pra reordenar
- ➕ **Adicionar, editar e excluir contas** — com nick, elo, observações e pasta
- 📥 **Importar contas** — cole no formato `login:senha` ou `login:senha Nick#TAG`, linha por linha
- 📤 **Exportar contas** — gera um `.txt` com login, senha e nick das contas selecionadas
- 💾 **Backup automático** — salvo em `backup_contas.txt` na pasta de instalação toda vez que algo muda
- 🗑️ **Lixeira** — contas excluídas ficam na lixeira e podem ser restauradas ou apagadas de vez
- 🎮 **Login automático** — loga direto no Riot Client com um clique via PowerShell
- 📊 **Busca de elo** — busca elo, vitórias e derrotas via Riot API (requer chave gratuita)
- 🔍 **Dados LCU** — avalia a conta logada no League Client: nível, essência azul/laranja, campeões e skins
- 🖼️ **Colagem de skins** — gera uma pasta com splash arts das skins da conta em grade, salvo em Downloads
- 🎯 **Simulador de ranking** — calcula quantas partidas ou dias faltam para chegar no elo alvo
- 🔒 **Banco criptografado** — todos os dados ficam criptografados com AES-256 no seu computador
- 🔄 **Atualização automática** — o app verifica e instala atualizações sozinho via GitHub Releases

---

## 📥 Download

Acesse a página de [Releases](https://github.com/yannevic/cutekass/releases/latest) e baixe o instalador `.exe` mais recente.

> ⚠️ O Windows pode exibir um aviso de segurança na primeira instalação. Clique em **"Mais informações"** → **"Executar mesmo assim"** para continuar.

---

## 🔒 Segurança

O CuteKass foi desenvolvido com segurança como prioridade:

- Banco de dados criptografado com **AES-256** (SQLCipher)
- Chave de criptografia protegida pelo **Credential Manager do Windows**
- Dados armazenados **100% localmente** — nada é enviado para servidores externos
- Comunicação interna do Electron isolada e validada
- Exportação com aviso explícito sobre exposição de senhas

---

## 🌸 Sobre o projeto

O CuteKass nasceu de uma necessidade real: gerenciar várias contas de LoL sem perder a cabeça. Feito do zero com muitas florzinhas 🌸.

É gratuito, se quiser apoiar o desenvolvimento:

- ☕ [Ko-fi — ko-fi.com/nanafofa](https://ko-fi.com/nanafofa)
- 💛 Pix disponível dentro do próprio app, na sidebar

---

## 🛠️ Tecnologias

| Tecnologia | Versão |
|---|---|
| Electron | 29 |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| better-sqlite3-multiple-ciphers | 9.x |
| Vite | 6 |
| Turborepo | — |

---

## 🧪 Desenvolvimento

Pré-requisitos: **Node.js v20 LTS**
```bash
# Na raiz do monorepo
npm install
npm run dev
```

> 💜 O terminal vai encher de logs roxinhos do Vite e do Electron. É normal, é fofo, é o CuteKass funcionando.

---

## 📬 Contato

Dúvidas, sugestões ou só quer dizer oi:
**devnanalol@gmail.com**

---

<p align="center">Made with 🌸 by Nana</p>
