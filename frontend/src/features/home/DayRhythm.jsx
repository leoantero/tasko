import './DayRhythm.css'
import { formatarDuracao, formatarHora } from './tempo'

const INICIO_DIA = 8 * 60
const FIM_DIA = 22 * 60
const HORAS_MARCADAS = [8, 10, 12, 14, 16, 18, 20, 22]

const posicao = (minutos) =>
  Math.min(100, Math.max(0, ((minutos - INICIO_DIA) / (FIM_DIA - INICIO_DIA)) * 100))

const minutosDoDia = (valor) => {
  const data = new Date(valor)
  return data.getHours() * 60 + data.getMinutes()
}

// Sessões de hoje (formato da API): cada finalizada vira um bloco; a aberta vai até agora.
// Os vãos entre os blocos são as pausas.
function DayRhythm({ sessoes, agora }) {
  const agoraMin = minutosDoDia(agora)
  const focos = sessoes.filter((s) => s.fim)
  const minutosFoco = Math.round(focos.reduce((total, s) => total + (s.tempo_foco_segundos ?? 0), 0) / 60)
  const tarefasFocadas = new Set(focos.map((s) => s.tarefa_id)).size
  const blocos = sessoes.map((s) => ({
    id: s.id,
    inicio: minutosDoDia(s.inicio),
    fim: s.fim ? minutosDoDia(s.fim) : agoraMin,
    tipo: s.fim ? 'foco' : 'atual',
  }))
  const descricao = focos.length
    ? `${focos.length} ${focos.length === 1 ? 'sessão' : 'sessões'} de foco até ${formatarHora(agoraMin)}`
    : 'nenhuma sessão de foco concluída ainda'

  return (
    <section className="rhythm-card" aria-labelledby="rhythm-title">
      <header className="rhythm-head">
        <h2 id="rhythm-title">Ritmo de hoje</h2>
        <span className="rhythm-legend" aria-hidden="true">
          <span><i className="rhythm-swatch rhythm-swatch--foco" />Foco</span>
          <span><i className="rhythm-swatch rhythm-swatch--atual" />Em andamento</span>
        </span>
      </header>

      <div className="rhythm-track" role="img" aria-label={`Linha do tempo de hoje: ${descricao}`}>
        {blocos.map((bloco) => (
          <span
            key={bloco.id}
            className={`rhythm-block rhythm-block--${bloco.tipo}`}
            style={{ left: `${posicao(bloco.inicio)}%`, width: `${posicao(bloco.fim) - posicao(bloco.inicio)}%` }}
          />
        ))}
        <span className="rhythm-now" style={{ left: `${posicao(agoraMin)}%` }}>
          <span className="rhythm-now-label">{formatarHora(agoraMin)}</span>
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
          <dt>Tarefas</dt>
          <dd>{tarefasFocadas}</dd>
        </div>
      </dl>
    </section>
  )
}

export default DayRhythm
