# CuteKass

Gerenciador de contas para League of Legends, feito com Electron + React + SQLite.

## Funcionalidades

- Adicionar, editar e excluir contas
- Organizar contas em pastas
- Importar contas via bloco de notas (`login:senha` ou `login:senha Nick#TAG`)
- Backup automático em `backup_contas.txt` na pasta de instalação
- Login automático no Riot Client via PowerShell
- Busca de elo via Riot API
- Lixeira com restauração e esvaziamento
- Exportar contas selecionadas

## Download

Acesse a página de [Releases](../../releases) e baixe o instalador `.exe` mais recente.

## Tecnologias

- Electron 29
- React 19
- TypeScript
- better-sqlite3
- Tailwind CSS 4
- Turborepo

## Desenvolvimento

```bash
npm install
npm run dev
```

> Rode na raiz do monorepo.
