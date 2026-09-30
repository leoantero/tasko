import { useEffect, useId, useState } from 'react'
import { criarMeta, listarMetas } from '../../lib/api'
import { formatarData, lerData } from '../projects/datas'
import Dialogo from '../../components/Dialogo.jsx'
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
  const id = useId()
  const [metas, setMetas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [tipoFormulario, setTipoFormulario] = useState('tempo_foco_horas')
  const [criando, setCriando] = useState(false)
  const [erroCriacao, setErroCriacao] = useState('')

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

  async function salvarMeta(event) {
    event.preventDefault()
    const campos = new FormData(event.currentTarget)
    setCriando(true)
    setErroCriacao('')
    try {
      const meta = await criarMeta({
        tipo: campos.get('tipo'),
        valor_alvo: Number(campos.get('valor_alvo')),
        data_limite: campos.get('data_limite'),
      })
      setMetas((atuais) => [meta, ...atuais])
      setFormAberto(false)
    } catch (falha) {
      setErroCriacao(falha.message)
    } finally {
      setCriando(false)
    }
  }

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
      <header className="metas-heading">
        <h1>Metas</h1>
        <button
          type="button"
          className="btn btn--primario"
          onClick={() => {
            setTipoFormulario('tempo_foco_horas')
            setErroCriacao('')
            setFormAberto(true)
          }}
        >
          Nova meta
        </button>
      </header>
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
      {formAberto && (
        <Dialogo titulo="Nova meta" onFechar={() => setFormAberto(false)}>
          <form className="formulario meta-formulario" onSubmit={salvarMeta}>
            <div className="campo">
              <label htmlFor={`${id}-tipo`}>Tipo</label>
              <select
                id={`${id}-tipo`}
                name="tipo"
                value={tipoFormulario}
                onChange={(event) => setTipoFormulario(event.target.value)}
                data-autofocus
                required
              >
                {Object.entries(rotulosTipo).map(([tipo, rotulo]) => (
                  <option key={tipo} value={tipo}>{rotulo}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor={`${id}-alvo`}>Valor alvo ({unidadesTipo[tipoFormulario]})</label>
              <input
                id={`${id}-alvo`}
                name="valor_alvo"
                type="number"
                min={tipoFormulario === 'tempo_foco_horas' ? '0.01' : '1'}
                step={tipoFormulario === 'tempo_foco_horas' ? 'any' : '1'}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor={`${id}-prazo`}>Data limite</label>
              <input id={`${id}-prazo`} name="data_limite" type="date" required />
            </div>
            {erroCriacao && <p className="campo-erro" role="alert">{erroCriacao}</p>}
            <footer className="acoes">
              <button type="button" className="btn btn--secundario" onClick={() => setFormAberto(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primario" disabled={criando}>
                {criando ? 'Salvando…' : 'Criar meta'}
              </button>
            </footer>
          </form>
        </Dialogo>
      )}
    </main>
  )
}

export default MetasScreen