import { useId } from 'react'

// Minutos com atalhos, no mesmo padrão do campo de prazo (CampoPrazo).
function CampoMinutos({ rotulo, valor, onChange, atalhos, max, erro }) {
  const id = useId()

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo} (minutos)</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        step={1}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erro}
      />
      <div className="sugestoes" role="group" aria-label={`Atalhos de ${rotulo.toLowerCase()}`}>
        {atalhos.map((m) => (
          <button key={m} type="button" aria-pressed={Number(valor) === m} onClick={() => onChange(String(m))}>
            {m} min
          </button>
        ))}
      </div>
    </div>
  )
}

export default CampoMinutos
