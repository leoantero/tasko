import { useEffect, useRef, useState } from 'react'
import './FocusScreen.css'
import { useDados } from '../../lib/dados'
import { formatarRelogio } from '../home/tempo'
import ConfirmarEncerrar from './ConfirmarEncerrar.jsx'
import FocoAcoes from './FocoAcoes.jsx'
import FocoMostrador from './FocoMostrador.jsx'
import { EM_CURSO, minutos, restanteDe, useAgora, useFoco } from './foco'

const TITULOS = { 'fim-foco': 'Sessão concluída', 'fim-intervalo': 'Intervalo encerrado' }

function FocusScreen() {
  const { projetos, tarefas, sessoes, atualizarTarefa } = useDados()
  const foco = useFoco()
  const { estado } = foco
  const agora = useAgora(EM_CURSO.includes(estado?.fase))
  // Guarda a sessão que pediu confirmação: se o tempo acabar antes, o diálogo some sozinho.
  const [confirmarSessao, setConfirmarSessao] = useState(null)
  const primario = useRef(null)
  const tela = useRef(null)

  const fase = estado?.fase
  const confirmando = fase === 'foco' && confirmarSessao === estado.sessaoId
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

  if (!estado) {
    return (
      <main className="foco foco--vazio" ref={tela}>
        <h1>Nenhuma sessão em andamento</h1>
        <p>Abra um projeto e use "Iniciar foco" em uma tarefa para começar uma sessão Pomodoro.</p>
        <a className="foco-link" href="#/projetos" ref={primario}>
          Ver projetos
        </a>
      </main>
    )
  }

  const tarefa = tarefas.find((t) => t.id === estado.tarefaId)
  const projeto = projetos.find((p) => p.id === tarefa?.projeto_id)
  const anteriores = sessoes.filter((s) => s.tarefa_id === estado.tarefaId && s.fim)
  const focadoNaTarefa = anteriores.reduce((total, s) => total + (s.tempo_foco_segundos ?? 0), 0)
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
          onEncerrar={() => setConfirmarSessao(estado.sessaoId)}
          onConcluir={concluirTarefa}
          onVoltar={voltar}
        />

        {foco.erro && (
          <p className="foco-erro" role="alert">
            {foco.erro}
          </p>
        )}

        <p className="foco-historico">
          {fase === 'foco'
            ? `${anteriores.length + 1}ª sessão nesta tarefa`
            : `${anteriores.length} ${anteriores.length === 1 ? 'sessão' : 'sessões'} nesta tarefa`}
          {focadoNaTarefa > 0 && ` · ${minutos(focadoNaTarefa)} de foco no total`}
        </p>
      </section>

      <p className="sr-only" role="status">
        {fase === 'fim-foco' && `${status}. Você focou ${minutos(estado.focadoSeg)}.`}
        {fase === 'intervalo' && `Intervalo de ${minutos(estado.intervaloSeg)} começou.`}
        {fase === 'fim-intervalo' && 'Intervalo encerrado. Pronto para a próxima sessão?'}
        {fase === 'foco' && pausado && 'Sessão pausada. O tempo pausado não conta como foco.'}
      </p>

      {confirmando && (
        <ConfirmarEncerrar
          focadoSeg={estado.focoSeg - restante}
          focoSeg={estado.focoSeg}
          onFechar={() => setConfirmarSessao(null)}
          onEncerrar={async () => {
            await foco.encerrar()
            setConfirmarSessao(null)
          }}
        />
      )}
    </main>
  )
}

export default FocusScreen
