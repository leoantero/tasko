import { formatarDuracao, formatarHora } from './tempo'

const INICIO_DIA = 8 * 60
const FIM_DIA = 22 * 60
const HORAS_MARCADAS = [8, 10, 12, 14, 16, 18, 20, 22]

const posicao = (minutos) =>
  Math.min(100, Math.max(0, ((minutos - INICIO_DIA) / (FIM_DIA - INICIO_DIA)) * 100))

function DayRhythm({ blocos, sessaoInicio, agora }) {
  const focos = blocos.filter((b) => b.tipo === 'foco')
  const minutosFoco = focos.reduce((total, b) => total + (b.fim - b.inicio), 0)
  const pausas = blocos.length - focos.length
  const blocosComAtual = [...blocos, { inicio: sessaoInicio, fim: agora, tipo: 'atual' }]
  const descricao = focos.length
    ? `${focos.length} ${focos.length === 1 ? 'sessão' : 'sessões'} de foco até ${formatarHora(agora)}`
    : 'nenhuma sessão de foco concluída ainda'

  return (
    <section className="rhythm-card" aria-labelledby="rhythm-title">
      <header className="rhythm-head">
        <h2 id="rhythm-title">Ritmo de hoje</h2>
        <span className="rhythm-legend" aria-hidden="true">
          <span><i className="rhythm-swatch rhythm-swatch--foco" />Foco</span>
          <span><i className="rhythm-swatch rhythm-swatch--pausa" />Pausa</span>
        </span>
      </header>

      <div className="rhythm-track" role="img" aria-label={`Linha do tempo de hoje: ${descricao}`}>
        {blocosComAtual.map((bloco) => (
          <span
            key={`${bloco.tipo}-${bloco.inicio}`}
            className={`rhythm-block rhythm-block--${bloco.tipo}`}
            style={{ left: `${posicao(bloco.inicio)}%`, width: `${posicao(bloco.fim) - posicao(bloco.inicio)}%` }}
          />
        ))}
        <span className="rhythm-now" style={{ left: `${posicao(agora)}%` }}>
          <span className="rhythm-now-label">{formatarHora(agora)}</span>
        </span>
      </div>

      <div className="rhythm-hours" aria-hidden="true">
        {HORAS_MARCADAS.map((hora) => (
          <span key={hora} style={{ left: `${posicao(hora * 60)}%` }}>
            {hora}h
          </span>
        ))}
      </div>

      <dl className="rhythm-stats">
        <div>
          <dt>Pomodoros</dt>
          <dd>{focos.length}</dd>
        </div>
        <div>
          <dt>Em foco</dt>
          <dd>{formatarDuracao(minutosFoco)}</dd>
        </div>
        <div>
          <dt>Pausas</dt>
          <dd>{pausas}</dd>
        </div>
      </dl>
    </section>
  )
}

export default DayRhythm
