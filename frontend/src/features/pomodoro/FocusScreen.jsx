import { useEffect, useRef } from 'react'
import './FocusScreen.css'
import { useDados } from '../../lib/dados'
import { formatarRelogio } from '../home/tempo'
import FocoAcoes from './FocoAcoes.jsx'
import FocoMostrador from './FocoMostrador.jsx'
import { EM_CURSO, restanteDe, useAgora, useFoco } from './foco'

const TITULOS = { 'fim-foco': 'Sessão concluída', 'fim-intervalo': 'Intervalo encerrado' }

function FocusScreen() {
  const { projetos, tarefas, atualizarTarefa } = useDados()
  const foco = useFoco()
  const { estado } = foco
  const agora = useAgora(EM_CURSO.includes(estado?.fase))
  const primario = useRef(null)
  const tela = useRef(null)

  const fase = estado?.fase
  const restante = EM_CURSO.includes(fase) ? restanteDe(estado, agora) : 0
  const titulo = !estado
    ? 'Foco'
    : (TITULOS[fase] ?? `${formatarRelogio(restante)} · ${fase === 'foco' ? 'Foco' : 'Intervalo'}`)

  useEffect(() => {
    document.title = `${titulo} · Tasko`
  }, [titulo])

  // As ações mudam a cada fase (e a confirmação de encerrar fecha junto): o foco vai para a
  // ação principal, a não ser que o usuário esteja em outro lugar da página.
  useEffect(() => {
    const ativo = document.activeElement
    if (ativo && ativo !== document.body && !tela.current.contains(ativo)) return
    primario.current?.focus()
  }, [fase])

  if (!estado) return null

  const tarefa = tarefas.find((t) => t.id === estado.tarefaId)
  const projeto = projetos.find((p) => p.id === tarefa?.projeto_id)
  const pausado = estado.parado !== null
  const completa = estado.focadoSeg === estado.focoSeg

  const [segundos, legenda, progresso] = {
    foco: [restante, `de ${estado.focoSeg / 60} min`, 1 - restante / estado.focoSeg],
    intervalo: [restante, `intervalo de ${estado.intervaloSeg / 60} min`, 1 - restante / estado.intervaloSeg],
    'fim-foco': [estado.focadoSeg, 'focados', estado.focadoSeg / estado.focoSeg],
    'fim-intervalo': [estado.focoSeg, 'próximo foco', 0],
  }[fase]

  const status = {
    foco: pausado ? 'Pausada' : 'Focando',
    intervalo: 'Intervalo',
    'fim-foco': completa ? 'Sessão concluída' : 'Sessão encerrada',
    'fim-intervalo': 'Intervalo encerrado',
  }[fase]

  const voltar = () => {
    foco.sair()
    window.location.hash = projeto ? `#/projetos/${projeto.id}` : '#/projetos'
  }

  async function concluirTarefa() {
    await atualizarTarefa(tarefa.id, { status: 'concluida' })
    voltar()
  }

  return (
    <main className="foco" ref={tela}>
      <section className="foco-palco" data-fase={fase} data-pausado={pausado} aria-labelledby="foco-tarefa">
        <p className="foco-status">
          <span className="foco-status-ponto" aria-hidden="true" />
          {status}
        </p>

        <FocoMostrador segundos={segundos} legenda={legenda} progresso={progresso} />

        <div className="foco-tarefa">
          <h1 id="foco-tarefa">{tarefa?.titulo ?? 'Tarefa removida'}</h1>
          {projeto && <a href={`#/projetos/${projeto.id}`}>{projeto.nome}</a>}
        </div>

        <FocoAcoes
          tarefa={tarefa}
          primario={primario}
          onEncerrar={foco.encerrar}
          onConcluir={concluirTarefa}
          onVoltar={voltar}
        />

      </section>
    </main>
  )
}

export default FocusScreen
