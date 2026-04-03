import { useState } from 'react';
import { ELO_TIERS, DIVISOES, UNRANKED, gerarOpcoesElo } from '../lib/eloConfig';
import Select from './Select';

interface SimuladorModalProps {
  onClose: () => void;
}

// ─── Lógica de LP ─────────────────────────────────────────────────────────────

const ELOS_COM_DIVISAO = ELO_TIERS.filter((t) => t.temDivisao);
const ELOS_SEM_DIVISAO = ELO_TIERS.filter((t) => !t.temDivisao);

function eloParaPontos(elo: string): number {
  if (!elo || elo === UNRANKED.nome) return 0;

  const tierSemDiv = ELOS_SEM_DIVISAO.find((t) => elo === t.nome);
  if (tierSemDiv) {
    const idxBase = ELOS_COM_DIVISAO.length * 4;
    const idxExtra = ELOS_SEM_DIVISAO.findIndex((t) => t.nome === tierSemDiv.nome);
    return (idxBase + idxExtra) * 100;
  }

  const tier = ELOS_COM_DIVISAO.find((t) => elo.startsWith(t.nome));
  if (!tier) return 0;
  const tierIdx = ELOS_COM_DIVISAO.findIndex((t) => t.nome === tier.nome);
  const divStr = elo.replace(tier.nome, '').trim();
  const divIdx = DIVISOES.indexOf(divStr);
  const divOrdem = divIdx === -1 ? 0 : divIdx; // IV=0, III=1, II=2, I=3
  return (tierIdx * 4 + divOrdem) * 100;
}

function pontosParaElo(pontos: number): string {
  const totalComDiv = ELOS_COM_DIVISAO.length * 4;

  if (pontos >= totalComDiv * 100) {
    const idxExtra = Math.floor((pontos - totalComDiv * 100) / 100);
    const tier = ELOS_SEM_DIVISAO[Math.min(idxExtra, ELOS_SEM_DIVISAO.length - 1)];
    return tier.nome;
  }

  const slot = Math.floor(pontos / 100);
  const tierIdx = Math.floor(slot / 4);
  const divOrdem = slot % 4; // 0=IV, 1=III, 2=II, 3=I
  const tier = ELOS_COM_DIVISAO[Math.min(tierIdx, ELOS_COM_DIVISAO.length - 1)];
  const div = DIVISOES[divOrdem];
  return `${tier.nome} ${div}`;
}

function calcularJogos(
  eloAtual: string,
  lpAtual: number,
  eloAlvo: string,
  lpGanho: number
): number {
  const baseAtual = eloParaPontos(eloAtual);
  const baseAlvo = eloParaPontos(eloAlvo);
  const pontosAtual = baseAtual + lpAtual;
  const pontosAlvo = baseAlvo; // precisa chegar ao início do elo alvo // precisa chegar ao fim do elo alvo
  const diff = pontosAlvo - pontosAtual;
  if (diff <= 0) return 0;
  return Math.ceil(diff / lpGanho);
}

// ─── Componente ───────────────────────────────────────────────────────────────

const OPCOES_ELO = gerarOpcoesElo().filter((e) => e !== UNRANKED.nome);

export default function SimuladorModal({ onClose }: SimuladorModalProps) {
  const [eloAtual, setEloAtual] = useState('Ouro IV');
  const [lpAtual, setLpAtual] = useState(0);
  const [eloAlvo, setEloAlvo] = useState('Platina IV');
  const [lpGanho, setLpGanho] = useState(20);
  const [tipoCalculo, setTipoCalculo] = useState<'jogos' | 'dias'>('jogos');
  const [diasAlvo, setDiasAlvo] = useState(30);
  const [partidasPorDia, setPartidasPorDia] = useState(5);

  const jogosNecessarios = calcularJogos(eloAtual, lpAtual, eloAlvo, lpGanho);
  const eloAlvoIdx = eloParaPontos(eloAlvo);
  const eloAtualIdx = eloParaPontos(eloAtual) + lpAtual;
  const jaPegou = eloAlvoIdx <= eloAtualIdx;

  function renderResultado() {
    if (jaPegou) {
      return (
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: '#0B0F1A', border: '1px solid #3B136B' }}
        >
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-rift-200 font-semibold">Você já está nesse elo ou acima!</p>
        </div>
      );
    }

    if (tipoCalculo === 'jogos') {
      return (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: '#0B0F1A', border: '1px solid #3B136B' }}
          >
            <p className="text-4xl font-bold text-rift-300">{jogosNecessarios}</p>
            <p className="text-sm text-rift-200/60 mt-1">
              partidas para chegar em <span className="text-rift-200">{eloAlvo}</span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-rift-200/50">
            <div className="rounded-lg py-2 px-1" style={{ backgroundColor: '#1E0A38' }}>
              <p className="text-rift-200 font-semibold text-sm">
                {Math.ceil(jogosNecessarios / 3)}
              </p>
              <p>dias jogando 3/dia</p>
            </div>
            <div className="rounded-lg py-2 px-1" style={{ backgroundColor: '#1E0A38' }}>
              <p className="text-rift-200 font-semibold text-sm">
                {Math.ceil(jogosNecessarios / 5)}
              </p>
              <p>dias jogando 5/dia</p>
            </div>
            <div className="rounded-lg py-2 px-1" style={{ backgroundColor: '#1E0A38' }}>
              <p className="text-rift-200 font-semibold text-sm">
                {Math.ceil(jogosNecessarios / 10)}
              </p>
              <p>dias jogando 10/dia</p>
            </div>
          </div>
          <p className="text-xs text-rift-200/30 text-center">
            Ganhando {lpGanho} LP/jogo, você chegaria em{' '}
            <span className="text-rift-200/50">{eloAlvo}</span> após {jogosNecessarios} partidas
          </p>
        </div>
      );
    }

    const totalPartidas = diasAlvo * partidasPorDia;
    const lpTotal = totalPartidas * lpGanho;
    const eloFinal = pontosParaElo(eloParaPontos(eloAtual) + lpAtual + lpTotal);
    const chegaNoAlvo =
      lpTotal >= eloParaPontos(eloAlvo) + 100 - (eloParaPontos(eloAtual) + lpAtual);
    const diasParaChegar = Math.ceil(jogosNecessarios / partidasPorDia);

    return (
      <div className="flex flex-col gap-3">
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: '#0B0F1A', border: '1px solid #3B136B' }}
        >
          {chegaNoAlvo ? (
            <>
              <p className="text-green-400 font-semibold text-sm mb-1">
                ✅ Você chega no objetivo!
              </p>
              <p className="text-4xl font-bold text-rift-300">{diasParaChegar}</p>
              <p className="text-sm text-rift-200/60 mt-1">
                dias jogando <span className="text-rift-200">{partidasPorDia}/dia</span> para chegar
                em <span className="text-rift-200">{eloAlvo}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-yellow-400 font-semibold text-sm mb-1">
                Em {diasAlvo} dias você chegaria em:
              </p>
              <p className="text-2xl font-bold text-rift-300">{eloFinal}</p>
              <p className="text-xs text-rift-200/40 mt-1">
                {totalPartidas} partidas · {lpTotal} LP ganhos
              </p>
              <p className="text-xs text-rift-200/30 mt-2">
                Para chegar em <span className="text-rift-200/50">{eloAlvo}</span> você precisaria
                de <span className="text-rift-200/50">{diasParaChegar} dias</span> nesse ritmo
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="bg-void-900 border border-void-800 rounded-xl w-full max-w-md p-6 flex flex-col gap-4 shadow-xl shadow-black/50 scrollbar-custom"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#5a1fa8 transparent',
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-rift-200 text-lg font-semibold">🎯 Simular ranking</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-rift-200/40 hover:text-rift-200 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Elo atual + LP */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rift-200/50">Elo atual</label>
            <Select
              value={eloAtual}
              onChange={setEloAtual}
              options={OPCOES_ELO.map((e) => ({ value: e, label: e }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-rift-200/50">LP atual</label>
            <input
              type="text"
              inputMode="numeric"
              value={lpAtual === 0 ? '' : lpAtual}
              placeholder="0"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                setLpAtual(v === '' ? 0 : Math.min(99, Number(v)));
              }}
              className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 text-sm outline-none focus:ring-2 focus:ring-rift-400 transition-colors"
            />
          </div>
        </div>

        {/* Elo alvo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-rift-200/50">Elo alvo</label>
          <Select
            value={eloAlvo}
            onChange={setEloAlvo}
            options={OPCOES_ELO.map((e) => ({ value: e, label: e }))}
          />
        </div>

        {/* LP médio por jogo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-rift-200/50">LP médio por vitória</label>
          <input
            type="text"
            inputMode="numeric"
            value={lpGanho === 0 ? '' : lpGanho}
            placeholder="20"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              setLpGanho(v === '' ? 0 : Math.min(100, Number(v)));
            }}
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 text-sm outline-none focus:ring-2 focus:ring-rift-400 transition-colors"
          />
        </div>

        {/* Tipo de cálculo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-rift-200/50">Quero saber...</label>
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: '#3B136B' }}
          >
            <button
              type="button"
              onClick={() => setTipoCalculo('jogos')}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: tipoCalculo === 'jogos' ? '#3B136B' : 'transparent',
                color: tipoCalculo === 'jogos' ? '#CFA6FF' : '#5A3A8A',
              }}
            >
              Quantos jogos faltam
            </button>
            <button
              type="button"
              onClick={() => setTipoCalculo('dias')}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: tipoCalculo === 'dias' ? '#3B136B' : 'transparent',
                color: tipoCalculo === 'dias' ? '#CFA6FF' : '#5A3A8A',
              }}
            >
              Simular por dias
            </button>
          </div>
        </div>

        {/* Inputs de dias */}
        {tipoCalculo === 'dias' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rift-200/50">Partidas por dia</label>
              <input
                type="text"
                inputMode="numeric"
                value={partidasPorDia === 0 ? '' : partidasPorDia}
                placeholder="5"
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setPartidasPorDia(v === '' ? 0 : Math.min(50, Number(v)));
                }}
                className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 text-sm outline-none focus:ring-2 focus:ring-rift-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-rift-200/50">Em quantos dias?</label>
              <input
                type="text"
                inputMode="numeric"
                value={diasAlvo === 0 ? '' : diasAlvo}
                placeholder="30"
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setDiasAlvo(v === '' ? 0 : Math.min(365, Number(v)));
                }}
                className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 text-sm outline-none focus:ring-2 focus:ring-rift-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Resultado */}
        <div className="mt-1">{renderResultado()}</div>
      </div>
    </div>
  );
}
