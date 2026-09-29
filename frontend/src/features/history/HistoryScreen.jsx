import { useEffect, useState } from 'react'
import { listarHistorico } from '../../lib/api'
import './HistoryScreen.css'

const rotulosTipo = { sessao: 'Sessão', tarefa: 'Tarefa', projeto: 'Projeto' }
const formatarTermino = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

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

  return (
    <main className="historico-main">
      <h1>Histórico</h1>
      {eventos.length ? (
        <ol className="historico-lista">
          {eventos.map(({ tipo, id, titulo, terminado_em }) => {
            const data = new Date(terminado_em)
            return (
              <li className="historico-item" key={`${tipo}-${id}`}>
                <span className="historico-tipo">{rotulosTipo[tipo] ?? 'Atividade'}</span>
                <strong className="historico-titulo">{titulo}</strong>
                <time dateTime={data.toISOString()}>{formatarTermino.format(data)}</time>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="historico-vazio">Nenhuma atividade no histórico ainda.</p>
      )}
    </main>
  )
}

export default HistoryScreen