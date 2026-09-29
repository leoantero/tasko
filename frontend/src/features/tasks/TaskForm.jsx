import { useId, useState } from 'react'
import Dialogo from '../../components/Dialogo.jsx'
import CampoPrazo from '../projects/CampoPrazo.jsx'
import { useDados } from '../../lib/dados'
import { dataParaInput } from '../projects/datas'
import PrioridadeCampo from './PrioridadeCampo.jsx'

const LIMITE_TITULO = 150

function TaskForm({ tarefa, onFechar, onSalvar }) {
  const { projetos } = useDados()
  const id = useId()
  const [titulo, setTitulo] = useState(tarefa.titulo)
  const [descricao, setDescricao] = useState(tarefa.descricao ?? '')
  const [prazo, setPrazo] = useState(dataParaInput(tarefa.prazo))
  const [prioridade, setPrioridade] = useState(tarefa.prioridade ?? null)
  const [projetoId, setProjetoId] = useState(tarefa.projeto_id ?? '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    const tituloLimpo = titulo.trim()
    if (!tituloLimpo) {
      setErro('A tarefa precisa de um título.')
      evento.currentTarget.querySelector('[data-autofocus]').focus()
      return
    }
    setSalvando(true)
    try {
      await onSalvar({
        titulo: tituloLimpo,
        descricao: descricao.trim() || null,
        prioridade,
        prazo: prazo || null,
        projeto_id: projetoId === '' ? null : Number(projetoId),
      })
      onFechar()
    } catch (erroApi) {
      setErro(erroApi.message)
      setSalvando(false)
    }
  }

  return (
    <Dialogo titulo="Editar tarefa" onFechar={onFechar} largura="pequena">
      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor={`${id}-titulo`}>Título</label>
          <input
            id={`${id}-titulo`}
            data-autofocus
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value)
              setErro('')
            }}
            maxLength={LIMITE_TITULO}
            aria-invalid={erro !== ''}
            aria-describedby={`${id}-titulo-info`}
            required
          />
          <span id={`${id}-titulo-info`} className="campo-info">
            {erro ? <span className="campo-erro">{erro}</span> : 'Obrigatório'}
            <span className="campo-contador">
              {titulo.length}/{LIMITE_TITULO}
            </span>
          </span>
        </div>

        <div className="campo">
          <label htmlFor={`${id}-descricao`}>Descrição</label>
          <textarea
            id={`${id}-descricao`}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            placeholder="Detalhes, links, próximos passos…"
          />
        </div>

        {/* Mover entre projeto e avulsas (HU02): a API aceita projeto_id no PUT. */}
        <div className="campo">
          <label htmlFor={`${id}-projeto`}>Projeto</label>
          <select id={`${id}-projeto`} value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
            <option value="">Sem projeto</option>
            {projetos
              .filter((p) => p.status === 'ativo' || p.id === tarefa.projeto_id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
          </select>
        </div>

        <PrioridadeCampo valor={prioridade} onChange={setPrioridade} />

        <CampoPrazo valor={prazo} onChange={setPrazo} />

        <footer className="acoes">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primario" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </footer>
      </form>
    </Dialogo>
  )
}

export default TaskForm
