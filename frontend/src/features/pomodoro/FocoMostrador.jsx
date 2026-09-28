import { formatarRelogio } from '../home/tempo'

const RAIO = 88
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

// Anel de progresso com o tempo no centro. A cor vem da fase (FocusScreen.css).
function FocoMostrador({ segundos, legenda, progresso }) {
  return (
    <div className="foco-mostrador">
      <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <circle className="foco-trilha" cx="100" cy="100" r={RAIO} />
        <circle
          className="foco-progresso"
          cx="100"
          cy="100"
          r={RAIO}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - progresso)}
        />
      </svg>
      <div className="foco-tempo" role="timer" aria-live="off">
        <span className="foco-digitos">{formatarRelogio(segundos)}</span>
        <span className="foco-legenda">{legenda}</span>
      </div>
    </div>
  )
}

export default FocoMostrador
