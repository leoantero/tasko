import './FocusCard.css'
import { useDados } from '../../lib/dados'
import { EM_CURSO, restanteDe, useAgora, useFoco } from '../pomodoro/foco'
import { ROTULO, mostradorDe, tipoDe } from './cartaoFoco'
import { formatarRelogio } from './tempo'

const RAIO = 88
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

// Mostra a sessão real do FocoProvider, a mesma da tela de foco (HU10).
function FocusCard({ proxima }) {
  const { projetos, tarefas } = useDados()
  const foco = useFoco()
  const { estado, tempos } = foco
  const emCurso = EM_CURSO.includes(estado?.fase)
  const agora = useAgora(emCurso)

  const tipo = tipoDe(estado)
  const pausado = tipo === 'pausada'
  const tarefa = estado ? tarefas.find((t) => t.id === estado.tarefaId) : null
  const projeto = projetos.find((p) => p.id === tarefa?.projeto_id)

  const [segundos, legenda, progresso] = mostradorDe(estado, emCurso ? restanteDe(estado, agora) : 0, tempos)

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
          {tarefa ? tarefa.titulo : 'Escolha uma tarefa para focar'}
        </h2>
        {projeto && <span className="focus-project">{projeto.nome}</span>}

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
