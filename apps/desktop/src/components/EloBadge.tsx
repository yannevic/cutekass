import { corDoElo } from '../lib/eloConfig';

interface Props {
  elo: string;
}

export default function EloBadge({ elo }: Props) {
  const cor = corDoElo(elo);

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${cor}22`, color: cor, border: `1px solid ${cor}55` }}
    >
      {elo}
    </span>
  );
}
