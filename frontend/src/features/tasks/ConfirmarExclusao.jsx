import { useState } from 'react'
import Dialogo from '../../components/Dialogo.jsx'

function ConfirmarExclusao({ tarefa, onFechar, onConfirmar }) {
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  // A API recusa (409) excluir tarefa com Pomodoros: mostra o motivo e mantém aberto.
  async function confirmar() {
    setExcluindo(true)
    try {
      await onConfirmar()
      onFechar()
    } catch (erroApi) {
      setErro(erroApi.message)
      setExcluindo(false)
    }
  }

  return (
    <Dialogo titulo="Excluir tarefa?" onFechar={onFechar} largura="pequena">
      <p className="dialogo-texto">
        <strong>{tarefa.titulo}</strong> será excluída. Essa ação não pode ser desfeita.
      </p>
      {erro && (
        <p className="campo-erro" role="alert">
          {erro}
        </p>
      )}
      <footer className="acoes">
        <button type="button" className="btn btn--secundario" onClick={onFechar} data-autofocus>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--perigo"
          onClick={confirmar}
          disabled={excluindo}
        >
          {excluindo ? 'Excluindo…' : 'Excluir'}
        </button>
      </footer>
    </Dialogo>
  )
}

export default ConfirmarExclusao
