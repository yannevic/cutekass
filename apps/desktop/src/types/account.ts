export interface Account {
  id: number;
  login: string;
  senha: string;
  nick: string;
  elo?: string;
  observacoes?: string;
  deletedAt?: string;
}
