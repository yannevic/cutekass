export interface EloTier {
  nome: string;
  cor: string;
  temDivisao: boolean;
}

export const ELO_TIERS: EloTier[] = [
  { nome: 'Ferro', cor: '#7d6b5e', temDivisao: true },
  { nome: 'Bronze', cor: '#a0522d', temDivisao: true },
  { nome: 'Prata', cor: '#a8a9ad', temDivisao: true },
  { nome: 'Ouro', cor: '#f0b429', temDivisao: true },
  { nome: 'Platina', cor: '#4db8a0', temDivisao: true },
  { nome: 'Esmeralda', cor: '#2ecc71', temDivisao: true },
  { nome: 'Diamante', cor: '#7ec8e3', temDivisao: true },
  { nome: 'Mestre', cor: '#9b59b6', temDivisao: false },
  { nome: 'Grão-Mestre', cor: '#e74c3c', temDivisao: false },
  { nome: 'Desafiante', cor: '#f1c40f', temDivisao: false },
];

export const DIVISOES = ['IV', 'III', 'II', 'I'];

export const UNRANKED: EloTier = { nome: 'Unranked', cor: '#6b7280', temDivisao: false };

export function gerarOpcoesElo(): string[] {
  const opcoes: string[] = [UNRANKED.nome];
  ELO_TIERS.forEach((tier) => {
    if (tier.temDivisao) {
      DIVISOES.forEach((div) => {
        opcoes.push(`${tier.nome} ${div}`);
      });
    } else {
      opcoes.push(tier.nome);
    }
  });
  return opcoes;
}

export function corDoElo(elo: string): string {
  const tier = ELO_TIERS.find((t) => elo.startsWith(t.nome));
  if (tier) return tier.cor;
  if (elo === UNRANKED.nome) return UNRANKED.cor;
  return '#6b7280';
}
