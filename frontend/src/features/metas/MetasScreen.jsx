import { useEffect, useState } from 'react'
import { listarMetas } from '../../lib/api'
import { dataParaInput } from '../projects/datas'

const rotulosTipo = {
  tempo_foco_horas: 'Tempo de foco',
  tarefas_concluidas: 'Tarefas concluídas',
  sessoes_pomodoro: 'Sessões Pomodoro',
  projetos_concluidos: 'Projetos concluídos',
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
    <main className="app-estado">
      <h1>Metas</h1>
      {metas.length ? (
        <ul>
          {metas.map((meta) => (
            <li key={meta.id}>
              {rotulosTipo[meta.tipo]}: {formatarNumero.format(meta.valor_alvo)}
              {meta.tipo === 'tempo_foco_horas' ? ' h' : ''}
              {' · até '}{dataParaInput(meta.data_limite)}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma meta cadastrada.</p>
      )}
    </main>
  )
}

export default MetasScreen