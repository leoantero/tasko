import { useId } from 'react'
import { somarDias } from './datas'

const ATALHOS = [
  { rotulo: 'Hoje', dias: 0 },
  { rotulo: '+1 semana', dias: 7 },
  { rotulo: '+1 mês', dias: 30 },
]

function CampoPrazo({ valor, onChange, atalhos = ATALHOS }) {
  const id = useId()

  return (
    <div className="campo">
      <label htmlFor={id}>Prazo</label>
      <input id={id} type="date" value={valor} onChange={(e) => onChange(e.target.value)} />
      <div className="sugestoes" role="group" aria-label="Atalhos de prazo">
        {atalhos.map((a) => (
          <button key={a.dias} type="button" onClick={() => onChange(somarDias(a.dias))}>
            {a.rotulo}
          </button>
        ))}
        <button type="button" aria-pressed={valor === ''} onClick={() => onChange('')}>
          Sem prazo
        </button>
      </div>
    </div>
  )
}

export default CampoPrazo
