export interface ParsedAccount {
  login: string;
  senha: string;
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

  // Tipo A: "login:senha" em uma linha
  if (lines.length === 1) {
    const colonIndex = lines[0].indexOf(':');
    if (colonIndex === -1) return null;

    return {
      login: lines[0].slice(0, colonIndex).trim(),
      senha: lines[0].slice(colonIndex + 1).trim(),
    };
  }

  // Pode ser que a primeira linha já seja "login:senha" mesmo com mais linhas
  const colonIndex = lines[0].indexOf(':');
  if (colonIndex !== -1) {
    return {
      login: lines[0].slice(0, colonIndex).trim(),
      senha: lines[0].slice(colonIndex + 1).trim(),
    };
  }

  // Tipo B: login na linha 0, senha na linha 1
  return {
    login: lines[0],
    senha: lines[1],
  };
}
