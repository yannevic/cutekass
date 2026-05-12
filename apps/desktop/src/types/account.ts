export interface Account {
  id: number;
  login: string;
  senha: string;
  nick?: string;
  elo?: string;
  observacoes?: string;
  deletedAt?: string;
  pastaId?: number | null;
  wins?: number | null;
  losses?: number | null;
  lcuNivel?: number | null;
  lcuEssenciaAzul?: number | null;
  lcuEssenciaLaranja?: number | null;
  lcuCampeoes?: number | null;
  lcuSkins?: number | null;
  lcuSkinsLista?: string | null;
  lcuFragsSkin?: number | null;
  lcuFragsSkinLista?: string | null;
  lcuAtualizadoEm?: string | null;
}
