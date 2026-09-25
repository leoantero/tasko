import { useEffect, useState } from 'react'
import './FocusCard.css'
import { formatarRelogio } from './tempo'

const RAIO = 88
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

const ROTULO_ESTADO = { focando: 'Focando agora', pausada: 'Sessão pausada', concluida: 'Sessão concluída' }

function FocusCard({ sessao, tarefa, proxima }) {
  const [fimEm, setFimEm] = useState(() => Date.now() + sessao.restanteSeg * 1000)
  const [agora, setAgora] = useState(() => Date.now())
  const [restanteNaPausa, setRestanteNaPausa] = useState(null)

  const pausado = restanteNaPausa !== null
  const restante = pausado ? restanteNaPausa : Math.max(0, Math.ceil((fimEm - agora) / 1000))
  const concluida = restante === 0

  // Recalcula a partir do horário de término: intervalos atrasam em abas de fundo.
  useEffect(() => {
    if (pausado || concluida) return undefined
    const id = setInterval(() => setAgora(Date.now()), 250)
    return () => clearInterval(id)
  }, [pausado, concluida])

  function alternarPausa() {
    if (pausado) {
      setFimEm(Date.now() + restanteNaPausa * 1000)
      setAgora(Date.now())
      setRestanteNaPausa(null)
    } else {
      setRestanteNaPausa(restante)
    }
  }

  const estado = concluida ? 'concluida' : pausado ? 'pausada' : 'focando'
  const progresso = 1 - restante / sessao.duracaoSeg

  return (
    <section className="focus-card" data-estado={estado} aria-labelledby="focus-title">
      <svg className="focus-pattern" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <path d="M 20 180 A 160 160 0 0 1 180 20" />
        <path d="M 70 180 A 110 110 0 0 1 180 70" />
      </svg>

      <div className="focus-dial">
        <svg className="focus-ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <circle className="focus-ring-track" cx="100" cy="100" r={RAIO} />
          <circle
            className="focus-ring-progress"
            cx="100"
            cy="100"
            r={RAIO}
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * (1 - progresso)}
          />
        </svg>
        <div className="focus-time" role="timer" aria-live="off">
          <span className="focus-digits">{formatarRelogio(restante)}</span>
          <span className="focus-digits-label">restantes</span>
        </div>
      </div>

      <div className="focus-info">
        <span className="focus-status">
          <span className="focus-status-dot" aria-hidden="true" />
          {ROTULO_ESTADO[estado]}
        </span>

        <h2 id="focus-title" className="focus-title">{tarefa.titulo}</h2>
        <span className="focus-project">{tarefa.projeto}</span>

        <div className="focus-cycles">
          {Array.from({ length: sessao.ciclosTotal }, (_, i) => {
            const feito = i < sessao.ciclo - 1 || (i === sessao.ciclo - 1 && concluida)
            const atual = i === sessao.ciclo - 1 && !concluida
            const classe = feito ? 'focus-cycle--feito' : atual ? 'focus-cycle--atual' : ''
            return <span key={i} className={`focus-cycle ${classe}`} aria-hidden="true" />
          })}
          <span>Ciclo {sessao.ciclo} de {sessao.ciclosTotal}</span>
        </div>

        <div className="focus-actions">
          <button
            type="button"
            className="focus-btn focus-btn--primario"
            onClick={alternarPausa}
            disabled={concluida}
          >
            {pausado && !concluida ? 'Retomar' : 'Pausar'}
          </button>
          <button
            type="button"
            className="focus-btn focus-btn--secundario"
            onClick={() => setRestanteNaPausa(0)}
            disabled={concluida}
          >
            Encerrar
          </button>
        </div>

        {proxima && (
          <p className="focus-next">
            A seguir: <strong>{proxima.titulo}</strong>
          </p>
        )}
      </div>
    </section>
  )
}

export default FocusCard
