import { useId, useState } from 'react'
import './ProjectForm.css'
import CampoPrazo from './CampoPrazo.jsx'
import { dataParaInput } from './datas'
import Dialogo from '../../components/Dialogo.jsx'
import ProjectCard from './ProjectCard.jsx'
import { mesmaCategoria } from './categorias'

const LIMITE_NOME = 120
const LIMITE_CATEGORIA = 60
const ATALHOS_PRAZO = [
  { rotulo: '+1 semana', dias: 7 },
  { rotulo: '+1 mês', dias: 30 },
]

// Serve para criar e para editar: com projeto, os campos vêm preenchidos.
function ProjectForm({ projeto, categorias, onFechar, onSalvar }) {
  const id = useId()
  const [nome, setNome] = useState(projeto?.nome ?? '')
  const [categoria, setCategoria] = useState(projeto?.categoria ?? '')
  const [descricao, setDescricao] = useState(projeto?.descricao ?? '')
  const [prazo, setPrazo] = useState(dataParaInput(projeto?.prazo))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      setErro('Dê um nome ao projeto.')
      evento.currentTarget.querySelector('[data-autofocus]').focus()
      return
    }

    const categoriaLimpa = categoria.trim()
    setSalvando(true)
    try {
      await onSalvar({
        nome: nomeLimpo,
        categoria: categorias.find((c) => mesmaCategoria(c, categoriaLimpa)) ?? (categoriaLimpa || null),
        descricao: descricao.trim() || null,
        prazo: prazo || null,
      })
      onFechar()
    } catch (erroApi) {
      setErro(erroApi.message)
      setSalvando(false)
    }
  }

  const previa = {
    nome: nome.trim() || 'Nome do projeto',
    categoria: categoria.trim() || null,
    descricao: descricao.trim() || null,
    prazo: prazo || null,
    status: projeto?.status ?? 'ativo',
    criado_em: projeto?.criado_em ?? new Date().toISOString(),
    concluido_em: projeto?.concluido_em ?? null,
  }

  return (
    <Dialogo titulo={projeto ? 'Editar projeto' : 'Novo projeto'} onFechar={onFechar}>
      <div className="project-dialog-grid">
        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="campo">
            <label htmlFor={`${id}-nome`}>Nome</label>
            <input
              id={`${id}-nome`}
              data-autofocus
              value={nome}
              onChange={(e) => {
                setNome(e.target.value)
                setErro('')
              }}
              maxLength={LIMITE_NOME}
              placeholder="Ex.: TCC, Portfólio, Inglês"
              aria-invalid={erro !== ''}
              aria-describedby={`${id}-nome-info`}
              required
            />
            <span id={`${id}-nome-info`} className="campo-info">
              {erro ? <span className="campo-erro">{erro}</span> : 'Obrigatório'}
              <span className="campo-contador">
                {nome.length}/{LIMITE_NOME}
              </span>
            </span>
          </div>

          <div className="campo">
            <label htmlFor={`${id}-categoria`}>Categoria</label>
            <input
              id={`${id}-categoria`}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              maxLength={LIMITE_CATEGORIA}
              placeholder="Ex.: Faculdade"
            />
            {categorias.length > 0 && (
              <div className="sugestoes" role="group" aria-label="Categorias já usadas">
                {categorias.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={mesmaCategoria(c, categoria.trim())}
                    onClick={() => setCategoria(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="campo">
            <label htmlFor={`${id}-descricao`}>Descrição</label>
            <textarea
              id={`${id}-descricao`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="O que você quer alcançar com este projeto?"
            />
          </div>

          <CampoPrazo valor={prazo} onChange={setPrazo} atalhos={ATALHOS_PRAZO} />

          <footer className="acoes">
            <button type="button" className="btn btn--secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primario" disabled={salvando}>
              {salvando ? 'Salvando…' : projeto ? 'Salvar' : 'Criar projeto'}
            </button>
          </footer>
        </form>

        <aside className="project-previa" aria-hidden="true">
          <span className="project-previa-rotulo">Pré-visualização</span>
          <ProjectCard projeto={previa} />
        </aside>
      </div>
    </Dialogo>
  )
}

export default ProjectForm
