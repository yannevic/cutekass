export interface ParsedAccount {
  login: string;
  senha: string;
  nick?: string;
}

export function parseAccountsText(text: string): ParsedAccount[] {
  const lines = text.split('\n').map((l) => l.trim());

  const blocks: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    if (line === '') {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      return;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1 && current.length > 0) {
      blocks.push(current);
      current = [];
    }

    current.push(line);
  });

  if (current.length > 0) blocks.push(current);

  const results: ParsedAccount[] = [];
  blocks.forEach((block) => {
    const parsed = parseBlock(block);
    if (parsed) results.push(parsed);
  });

  return results;
}

function nickValido(valor: string): boolean {
  const idx = valor.indexOf('#');
  return idx !== -1 && idx < valor.length - 1;
}

function parseBlock(lines: string[]): ParsedAccount | null {
  if (lines.length === 0) return null;

  let login = '';
  let senha = '';
  let nick: string | undefined;

  const colonIndex = lines[0].indexOf(':');
  if (colonIndex !== -1) {
    const afterColon = lines[0].slice(colonIndex + 1);
    const spaceIndex = afterColon.indexOf(' ');

    if (spaceIndex !== -1) {
      login = lines[0].slice(0, colonIndex).trim();
      senha = afterColon.slice(0, spaceIndex).trim();
      const possible = afterColon.slice(spaceIndex + 1).trim();
      if (nickValido(possible)) {
        nick = possible;
      }
    } else {
      login = lines[0].slice(0, colonIndex).trim();
      senha = afterColon.trim();
      if (lines[1] && nickValido(lines[1])) {
        nick = lines[1];
      }
    }
  } else if (lines.length >= 2) {
    login = lines[0];
    senha = lines[1];
    if (lines[2] && nickValido(lines[2])) {
      nick = lines[2];
    }
  } else {
    return null;
  }

  if (!login || !senha) return null;

  return { login, senha, nick };
}
