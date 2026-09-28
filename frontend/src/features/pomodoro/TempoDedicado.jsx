import { useId } from 'react'
import './TempoDedicado.css'
import { duracaoCurta, focoPorDia } from './produtividade'

const diaCurto = (data, hoje) =>
  data.toDateString() === hoje.toDateString()
    ? 'hoje'
    : data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

const diaLongo = (data) => data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })

// HU05: quanto tempo de foco foi dedicado ao projeto.
function TempoDedicado({ tarefas, sessoes }) {
  const id = useId()
  const hoje = new Date()
  const ids = new Set(tarefas.map((t) => t.id))
  const registradas = sessoes.filter((s) => s.fim && ids.has(s.tarefa_id))
  const total = registradas.reduce((soma, s) => soma + (s.tempo_foco_segundos ?? 0), 0)

  const dias = focoPorDia(registradas, 7, hoje)
  const semana = dias.reduce((soma, d) => soma + d.segundos, 0)
  const maiorDia = Math.max(...dias.map((d) => d.segundos))

  return (
    <section className="tempo" aria-labelledby={`${id}-titulo`}>
      <header className="tempo-head">
        <h2 id={`${id}-titulo`}>Tempo dedicado</h2>
        {registradas.length > 0 && (
          <p className="tempo-total">
            <strong>{duracaoCurta(total)}</strong> de foco em {registradas.length}{' '}
            {registradas.length === 1 ? 'sessão' : 'sessões'}
          </p>
        )}
      </header>

      {registradas.length === 0 ? (
        <p className="tempo-vazio">
          Nenhuma sessão registrada ainda. Use "Iniciar foco" em uma tarefa: o tempo é registrado sozinho ao fim
          de cada sessão.
        </p>
      ) : (
        <div className="tempo-graficos">
          <figure className="tempo-figura">
            <figcaption>
              Últimos 7 dias <span>{duracaoCurta(semana)}</span>
            </figcaption>
            <ol className="tempo-colunas" aria-hidden="true">
              {dias.map((d) => (
                <li key={d.data.toISOString()} className="tempo-dia">
                  <span className="tempo-trilho">
                    {d.segundos === maiorDia && maiorDia > 0 && (
                      <span className="tempo-rotulo">{duracaoCurta(d.segundos)}</span>
                    )}
                    {d.segundos > 0 && (
                      <span className="tempo-coluna" style={{ height: `${(d.segundos / maiorDia) * 100}%` }} />
                    )}
                    <span className="tempo-dica">
                      {diaLongo(d.data)}: {duracaoCurta(d.segundos)}
                    </span>
                  </span>
                  <span className="tempo-dia-nome">{diaCurto(d.data, hoje)}</span>
                </li>
              ))}
            </ol>
            <table className="sr-only">
              <caption>Tempo de foco nos últimos 7 dias</caption>
              <tbody>
                {dias.map((d) => (
                  <tr key={d.data.toISOString()}>
                    <th scope="row">{diaLongo(d.data)}</th>
                    <td>{duracaoCurta(d.segundos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </div>
      )}
    </section>
  )
}

export default TempoDedicado
