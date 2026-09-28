import { useId } from 'react'
import './Prioridade.css'
import { NOME_PRIORIDADE, PRIORIDADES } from './tarefas'

// Grupo de rádios (setas do teclado trocam a opção) usado no painel "Editar tarefa".
function PrioridadeCampo({ valor, onChange }) {
  const nome = useId()

  return (
    <fieldset className="campo prio-campo">
      <legend>Prioridade</legend>
      <div className="prio-opcoes">
        {PRIORIDADES.map((opcao) => (
          <label key={opcao ?? 0} className="prio-opcao">
            <input type="radio" name={nome} checked={opcao === valor} onChange={() => onChange(opcao)} />
            <span className={`prio-ponto prio-ponto--${opcao ?? 0}`} aria-hidden="true" />
            {opcao ? NOME_PRIORIDADE[opcao] : 'Sem prioridade'}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default PrioridadeCampo
