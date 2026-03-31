export interface ParsedAccount {
  login: string;
  senha: string;
  nick?: string;
}

export function parseAccountsText(text: string): ParsedAccount[] {
  const blocks = text
    .split(/\n[ \t]*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const results: ParsedAccount[] = [];

  blocks.forEach((block) => {
    const parsed = parseBlock(block);
    if (parsed) results.push(parsed);
  });

  return results;
}

function parseBlock(block: string): ParsedAccount | null {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  let login = '';
  let senha = '';
  let nick: string | undefined;

  // Tipo A: primeira linha é "login:senha"
  const colonIndex = lines[0].indexOf(':');
  if (colonIndex !== -1) {
    login = lines[0].slice(0, colonIndex).trim();
    senha = lines[0].slice(colonIndex + 1).trim();
    // linha 1 pode ser nick#tag
    if (lines[1] && lines[1].includes('#')) {
      nick = lines[1];
    }
  } else if (lines.length >= 2) {
    // Tipo B: login na linha 0, senha na linha 1
    login = lines[0];
    senha = lines[1];
    // linha 2 pode ser nick#tag
    if (lines[2] && lines[2].includes('#')) {
      nick = lines[2];
    }
  } else {
    return null;
  }

  if (!login || !senha) return null;

  return { login, senha, nick };
}
