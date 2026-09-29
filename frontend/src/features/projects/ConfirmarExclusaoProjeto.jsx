import { useState } from 'react'
import Dialogo from '../../components/Dialogo.jsx'

// Excluir projeto com tarefas é uma escolha, não um efeito colateral: soltar tira o
// contexto da tarefa, excluir tira o registro. Quem decide é quem está apagando.
function ConfirmarExclusaoProjeto({ projeto, quantasTarefas, onFechar, onConfirmar }) {
  const [destino, setDestino] = useState('soltar')
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  async function confirmar() {
    setExcluindo(true)
    try {
      await onConfirmar(destino)
      onFechar()
    } catch (falha) {
      setErro(falha.message)
      setExcluindo(false)
    }
  }

  return (
    <Dialogo titulo="Excluir projeto?" onFechar={onFechar} largura="pequena">
      <p className="dialogo-texto">
        <strong>{projeto.nome}</strong> será excluído. Essa ação não pode ser desfeita.
      </p>

      {quantasTarefas > 0 && (
        <fieldset className="campo dialogo-escolha">
          <legend>
            {quantasTarefas === 1 ? 'A tarefa deste projeto' : `As ${quantasTarefas} tarefas deste projeto`}
          </legend>
          <label className="dialogo-opcao">
            <input
              type="radio"
              name="destino-tarefas"
              checked={destino === 'soltar'}
              onChange={() => setDestino('soltar')}
            />
            Viram tarefas avulsas
          </label>
          <label className="dialogo-opcao">
            <input
              type="radio"
              name="destino-tarefas"
              checked={destino === 'excluir'}
              onChange={() => setDestino('excluir')}
            />
            São excluídas junto
          </label>
          <span className="campo-info">O tempo de foco já registrado é mantido nos dois casos.</span>
        </fieldset>
      )}

      {erro && (
        <p className="campo-erro" role="alert">
          {erro}
        </p>
      )}

      <footer className="acoes">
        <button type="button" className="btn btn--secundario" onClick={onFechar} data-autofocus>
          Cancelar
        </button>
        <button type="button" className="btn btn--perigo" onClick={confirmar} disabled={excluindo}>
          {excluindo ? 'Excluindo…' : 'Excluir projeto'}
        </button>
      </footer>
    </Dialogo>
  )
}

export default ConfirmarExclusaoProjeto
