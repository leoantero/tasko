import { useEffect, useState } from 'react'
import { resumoDashboard } from '../../lib/api'

const formatarNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

function DashboardScreen() {
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    resumoDashboard()
      .then((dados) => ativo && setResumo(dados))
      .catch((falha) => ativo && setErro(falha.message))
    return () => {
      ativo = false
    }
  }, [])

  if (erro) {
    return (
      <main className="app-estado" role="alert">
        <strong>Não foi possível carregar o dashboard.</strong>
        <p>{erro}</p>
      </main>
    )
  }

  if (!resumo) {
    return <main className="app-estado" aria-live="polite">Carregando dashboard…</main>
  }

  const metricas = [
    { rotulo: 'Tempo de foco', valor: formatarNumero.format(resumo.total_horas_foco), unidade: 'h' },
    { rotulo: 'Sessões Pomodoro', valor: formatarNumero.format(resumo.numero_sessoes) },
    { rotulo: 'Tarefas concluídas', valor: formatarNumero.format(resumo.tarefas_concluidas) },
    { rotulo: 'Projetos ativos', valor: formatarNumero.format(resumo.projetos_ativos) },
  ]

  return (
    <main className="dashboard-main">
      <header className="dashboard-heading">
        <h1>Dashboard</h1>
        <p>Últimos 7 dias</p>
      </header>
      <section aria-label="Resumo de produtividade">
        <dl className="dashboard-metricas">
          {metricas.map(({ rotulo, valor, unidade }) => (
            <div className="dashboard-metrica" key={rotulo}>
              <dt>{rotulo}</dt>
              <dd>
                <strong>{valor}</strong>
                {unidade && <span>{unidade}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}

export default DashboardScreen