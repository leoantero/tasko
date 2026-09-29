import { useEffect, useState } from 'react'
import { resumoDashboard } from '../../lib/api'
import { dataParaInput, formatarData, lerData } from '../projects/datas'
import { formatarDuracao } from '../home/tempo'
import './DashboardDaily.css'

const formatarNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const formatarSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

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
  const dias = resumo.tempo_por_dia
  const maiorTempo = Math.max(...dias.map(({ total_segundos }) => total_segundos), 0)
  const distribuicao = resumo.distribuicao_por_projeto
  const totalDistribuido = distribuicao.reduce((total, projeto) => total + projeto.total_segundos, 0)

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
      <section className="dashboard-serie" aria-labelledby="dashboard-serie-titulo">
        <h2 id="dashboard-serie-titulo">Tempo de foco por dia</h2>
        <ol className="dashboard-serie-lista">
          {dias.map(({ dia, total_segundos }) => {
            const data = lerData(dia)
            const chaveDia = dataParaInput(dia)
            const largura = maiorTempo ? (total_segundos / maiorTempo) * 100 : 0

            return (
              <li className="dashboard-serie-item" key={chaveDia}>
                <time dateTime={chaveDia}>
                  {formatarSemana.format(data)} {formatarData(data)}
                </time>
                <div className="dashboard-serie-trilho" aria-hidden="true">
                  <span style={{ width: `${largura}%` }} />
                </div>
                <span className="dashboard-serie-valor">
                  {formatarDuracao(Math.round(total_segundos / 60))}
                </span>
              </li>
            )
          })}
        </ol>
      </section>
      <section className="dashboard-projetos" aria-labelledby="dashboard-projetos-titulo">
        <h2 id="dashboard-projetos-titulo">Distribuição por projeto</h2>
        {distribuicao.length ? (
          <ol className="dashboard-projetos-lista">
            {distribuicao.map(({ projeto_id, projeto_nome, total_segundos }) => {
              const participacao = totalDistribuido ? (total_segundos / totalDistribuido) * 100 : 0

              return (
                <li className="dashboard-projeto" key={projeto_id ?? 'sem-projeto'}>
                  <div className="dashboard-projeto-info">
                    <strong>{projeto_nome}</strong>
                    <span>
                      {formatarDuracao(Math.round(total_segundos / 60))}
                      {' · '}{formatarNumero.format(participacao)}%
                    </span>
                  </div>
                  <div className="dashboard-projeto-trilho" aria-hidden="true">
                    <span style={{ width: `${participacao}%` }} />
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="dashboard-projetos-vazio">Sem sessões de foco no período.</p>
        )}
      </section>
    </main>
  )
}

export default DashboardScreen