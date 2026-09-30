import { useState } from 'react'
import Dialogo from '../../components/Dialogo.jsx'

function ConfirmarExclusaoMeta({ descricao, onFechar, onConfirmar }) {
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  async function confirmar() {
    setExcluindo(true)
    try {
      await onConfirmar()
      onFechar()
    } catch (falha) {
      setErro(falha.message)
      setExcluindo(false)
    }
  }

  return (
    <Dialogo titulo="Excluir meta?" onFechar={onFechar} largura="pequena">
      <p className="dialogo-texto">
        <strong>{descricao}</strong> será excluída. Essa ação não pode ser desfeita.
      </p>
      {erro && <p className="campo-erro" role="alert">{erro}</p>}
      <footer className="acoes">
        <button type="button" className="btn btn--secundario" onClick={onFechar} data-autofocus>
          Cancelar
        </button>
        <button type="button" className="btn btn--perigo" onClick={confirmar} disabled={excluindo}>
          {excluindo ? 'Excluindo…' : 'Excluir meta'}
        </button>
      </footer>
    </Dialogo>
  )
}

export default ConfirmarExclusaoMeta