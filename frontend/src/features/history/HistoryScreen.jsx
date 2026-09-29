import { useEffect, useState } from 'react'
import { listarHistorico } from '../../lib/api'
import { formatarDuracao } from '../home/tempo'
import './HistoryScreen.css'

const rotulosTipo = { sessao: 'Sessão', tarefa: 'Tarefa', projeto: 'Projeto' }
const formatarDia = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const formatarHorario = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

function HistoryScreen() {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    listarHistorico()
      .then((lista) => ativo && setEventos(lista))
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [])

  if (carregando) {
    return <main className="app-estado" aria-live="polite">Carregando histórico…</main>
  }

  if (erro) {
    return (
      <main className="app-estado" role="alert">
        <strong>Não foi possível carregar o histórico.</strong>
        <p>{erro}</p>
      </main>
    )
  }

  const grupos = new Map()
  eventos.forEach((evento) => {
    const data = new Date(evento.terminado_em)
    const chave = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`
    if (!grupos.has(chave)) grupos.set(chave, { data, eventos: [] })
    grupos.get(chave).eventos.push(evento)
  })

  return (
    <main className="historico-main">
      <h1>Histórico</h1>
      {eventos.length ? (
        <div className="historico-dias">
          {[...grupos].map(([chave, grupo]) => (
            <section className="historico-dia" key={chave} aria-labelledby={`historico-dia-${chave}`}>
              <h2 id={`historico-dia-${chave}`}>{formatarDia.format(grupo.data)}</h2>
              <ol className="historico-lista">
                {grupo.eventos.map(({ tipo, id, titulo, terminado_em, tempo_foco_segundos }) => {
                  const data = new Date(terminado_em)
                  return (
                    <li className="historico-item" key={`${tipo}-${id}`}>
                      <span className="historico-tipo">{rotulosTipo[tipo] ?? 'Atividade'}</span>
                      <strong className="historico-titulo">{titulo}</strong>
                      <time dateTime={data.toISOString()}>{formatarHorario.format(data)}</time>
                      {tipo === 'sessao' && typeof tempo_foco_segundos === 'number' && (
                        <span className="historico-duracao">
                          {formatarDuracao(Math.round(tempo_foco_segundos / 60))} de foco
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <p className="historico-vazio">Nenhuma atividade no histórico ainda.</p>
      )}
    </main>
  )
}

export default HistoryScreen