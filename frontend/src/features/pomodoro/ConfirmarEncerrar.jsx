import Dialogo from '../../components/Dialogo.jsx'
import { minutos } from './foco'

function ConfirmarEncerrar({ focadoSeg, focoSeg, onFechar, onEncerrar }) {
  return (
    <Dialogo titulo="Encerrar a sessão?" onFechar={onFechar} largura="pequena">
      <p className="dialogo-texto">
        Você focou <strong>{minutos(focadoSeg)}</strong> de {focoSeg / 60} min. Esse tempo será registrado na
        tarefa.
      </p>
      <footer className="acoes">
        <button type="button" className="btn btn--secundario" onClick={onFechar} data-autofocus>
          Continuar focando
        </button>
        <button type="button" className="btn btn--primario" onClick={onEncerrar}>
          Encerrar
        </button>
      </footer>
    </Dialogo>
  )
}

export default ConfirmarEncerrar
