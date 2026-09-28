import './FocusCard.css'
import { useDados } from '../../lib/dados'
import { EM_CURSO, restanteDe, useAgora, useFoco } from '../pomodoro/foco'
import { ehHoje } from '../pomodoro/produtividade'
import { ROTULO, mostradorDe, tipoDe } from './cartaoFoco'
import { formatarRelogio } from './tempo'

const RAIO = 88
const CIRCUNFERENCIA = 2 * Math.PI * RAIO
const POR_CICLO = 4

// Mostra a sessão real do FocoProvider (a mesma da tela de foco) ou, sem sessão,
// sugere por onde começar para retomar o trabalho rapidamente (HU10).
function FocusCard({ proxima, onIniciar }) {
  const { projetos, tarefas, sessoes } = useDados()
  const foco = useFoco()
  const { estado, tempos } = foco
  const emCurso = EM_CURSO.includes(estado?.fase)
  const agora = useAgora(emCurso)

  const tipo = tipoDe(estado)
  const pausado = tipo === 'pausada'
  const tarefa = estado ? tarefas.find((t) => t.id === estado.tarefaId) : proxima
  const projeto = projetos.find((p) => p.id === tarefa?.projeto_id)

  const [segundos, legenda, progresso] = mostradorDe(estado, emCurso ? restanteDe(estado, agora) : 0, tempos)

  // Técnica Pomodoro: um intervalo maior a cada 4 sessões. Conta as de hoje.
  const feitasHoje = sessoes.filter((s) => s.fim && ehHoje(s.inicio)).length
  const noCiclo = feitasHoje % POR_CICLO
  const seguinte = estado ? proxima : null

  return (
    <section className="focus-card" data-estado={tipo} aria-labelledby="focus-title">
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
          <span className="focus-digits">{formatarRelogio(segundos)}</span>
          <span className="focus-digits-label">{legenda}</span>
        </div>
      </div>

      <div className="focus-info">
        <span className="focus-status">
          <span className="focus-status-dot" aria-hidden="true" />
          {ROTULO[tipo]}
        </span>

        <h2 id="focus-title" className="focus-title">
          {tarefa ? tarefa.titulo : 'Tudo em dia'}
        </h2>
        {projeto && <span className="focus-project">{projeto.nome}</span>}
        {!estado && tarefa && <p className="focus-dica">Sugestão: a tarefa de maior prioridade e prazo mais próximo.</p>}

        <div className="focus-cycles">
          {Array.from({ length: POR_CICLO }, (_, i) => {
            const classe = i < noCiclo ? 'focus-cycle--feito' : i === noCiclo && tipo !== 'livre' ? 'focus-cycle--atual' : ''
            return <span key={i} className={`focus-cycle ${classe}`} aria-hidden="true" />
          })}
          <span>
            {estado?.fase === 'foco'
              ? `Ciclo ${noCiclo + 1} de ${POR_CICLO}`
              : `${feitasHoje} ${feitasHoje === 1 ? 'sessão' : 'sessões'} hoje`}
          </span>
        </div>

        <div className="focus-actions">
          {estado?.fase === 'foco' && (
            <button type="button" className="focus-btn focus-btn--primario" onClick={pausado ? foco.retomar : foco.pausar}>
              {pausado ? 'Retomar' : 'Pausar'}
            </button>
          )}
          {estado && (
            <a className="focus-btn focus-btn--secundario" href="#/foco">
              Abrir sessão
            </a>
          )}
          {!estado && tarefa && (
            <button type="button" className="focus-btn focus-btn--primario" onClick={() => onIniciar(tarefa)}>
              Iniciar foco
            </button>
          )}
          {!estado && !tarefa && (
            <a className="focus-btn focus-btn--secundario" href="#/projetos">
              Ver projetos
            </a>
          )}
        </div>

        {seguinte && (
          <p className="focus-next">
            A seguir: <strong>{seguinte.titulo}</strong>
          </p>
        )}
      </div>
    </section>
  )
}

export default FocusCard
