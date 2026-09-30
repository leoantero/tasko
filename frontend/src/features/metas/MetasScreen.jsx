import { useEffect, useState } from 'react'
import { listarMetas } from '../../lib/api'
import { formatarData, lerData } from '../projects/datas'
import './MetasScreen.css'

const rotulosTipo = {
  tempo_foco_horas: 'Tempo de foco',
  tarefas_concluidas: 'Tarefas concluídas',
  sessoes_pomodoro: 'Sessões Pomodoro',
  projetos_concluidos: 'Projetos concluídos',
}
const unidadesTipo = {
  tempo_foco_horas: 'h',
  tarefas_concluidas: 'tarefas',
  sessoes_pomodoro: 'sessões',
  projetos_concluidos: 'projetos',
}
const formatarNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

function MetasScreen() {
  const [metas, setMetas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    listarMetas()
      .then((lista) => ativo && setMetas(lista))
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [])

  if (carregando) {
    return <main className="app-estado" aria-live="polite">Carregando metas…</main>
  }

  if (erro) {
    return (
      <main className="app-estado" role="alert">
        <strong>Não foi possível carregar as metas.</strong>
        <p>{erro}</p>
      </main>
    )
  }

  return (
    <main className="metas-main">
      <h1>Metas</h1>
      {metas.length ? (
        <ul className="metas-lista">
          {metas.map((meta) => {
            const progressoVisual = Math.max(0, Math.min(meta.progresso, meta.valor_alvo))
            const unidade = unidadesTipo[meta.tipo]

            return (
              <li className="meta-item" key={meta.id}>
                <article className="meta-card">
                  <header>
                    <h2>{rotulosTipo[meta.tipo]}</h2>
                    <p>Até {formatarData(lerData(meta.data_limite))}</p>
                  </header>
                  <p className="meta-valores">
                    <strong>{formatarNumero.format(meta.progresso)}</strong>
                    {' / '}{formatarNumero.format(meta.valor_alvo)} {unidade}
                  </p>
                  <progress
                    max={meta.valor_alvo}
                    value={progressoVisual}
                    aria-label={`${rotulosTipo[meta.tipo]}: ${formatarNumero.format(meta.progresso)} de ${formatarNumero.format(meta.valor_alvo)} ${unidade}`}
                  />
                </article>
              </li>
            )
          })}
        </ul>
      ) : (
        <p>Nenhuma meta cadastrada.</p>
      )}
    </main>
  )
}

export default MetasScreen