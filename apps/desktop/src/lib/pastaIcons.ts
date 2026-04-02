export interface PastaIcon {
  id: string;
  label: string;
  svg: string;
}

export const PASTA_ICONS: PastaIcon[] = [
  {
    id: 'folder',
    label: 'Pasta',
    svg: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>`,
  },
  {
    id: 'sword',
    label: 'Espada',
    svg: `<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>`,
  },
  {
    id: 'shield',
    label: 'Escudo',
    svg: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  },
  {
    id: 'crown',
    label: 'Coroa',
    svg: `<path d="M2 20h20"/><path d="M5 20V8l7-5 7 5v12"/>`,
  },
  {
    id: 'star',
    label: 'Estrela',
    svg: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  },
  {
    id: 'zap',
    label: 'Raio',
    svg: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  },
  {
    id: 'skull',
    label: 'Caveira',
    svg: `<path d="M12 2a8 8 0 0 0-8 8v1a4 4 0 0 0 0 8h1v1a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1h1a4 4 0 0 0 0-8v-1a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/>`,
  },
  {
    id: 'gem',
    label: 'Gema',
    svg: `<polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="3" x2="6" y2="9"/><line x1="12" y1="3" x2="18" y2="9"/>`,
  },
  {
    id: 'target',
    label: 'Alvo',
    svg: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  },
  {
    id: 'flame',
    label: 'Chama',
    svg: `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`,
  },
  {
    id: 'trophy',
    label: 'Troféu',
    svg: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>`,
  },
  {
    id: 'eye',
    label: 'Olho',
    svg: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  },
  {
    id: 'heart',
    label: 'Coração',
    svg: `<path d="M12 21C12 21 4 15 4 9c0-3.5 2.5-5.5 5-5 1.5.3 2.5 1.2 3 2 .5-.8 1.5-1.7 3-2 2.5-.5 5 1.5 5 5 0 6-8 12-8 12z"/>`,
  },
];

export function getIcon(id: string): PastaIcon {
  return PASTA_ICONS.find((i) => i.id === id) ?? PASTA_ICONS[0];
}
