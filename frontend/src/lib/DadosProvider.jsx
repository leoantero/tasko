import { useState } from 'react'
import { DadosContext } from './dados'
import { sessoesIniciais } from '../features/pomodoro/mockSessoes'
import { projetosIniciais } from '../features/projects/mockProjetos'
import { tarefasIniciais } from '../features/tasks/mockTarefas'

// Fonte única de projetos, tarefas e sessões Pomodoro para todas as telas. Hoje em memória (mock);
// na integração, cada ação passa a chamar a API e as telas não mudam.

let ultimoId = 1000
const agora = () => new Date().toISOString()

export function DadosProvider({ children }) {
  const [projetos, setProjetos] = useState(projetosIniciais)
  const [tarefas, setTarefas] = useState(tarefasIniciais)
  const [sessoes, setSessoes] = useState(sessoesIniciais)

  async function criarProjeto(dados) {
    const projeto = { ...dados, id: ++ultimoId, status: 'ativo', criado_em: agora(), concluido_em: null }
    setProjetos((atuais) => [projeto, ...atuais])
    return projeto
  }

  async function criarTarefa(dados) {
    const tarefa = {
      descricao: null,
      prioridade: null,
      prazo: null,
      ...dados,
      id: ++ultimoId,
      status: 'pendente',
      criado_em: agora(),
      concluida_em: null,
    }
    setTarefas((atuais) => [tarefa, ...atuais])
    return tarefa
  }

  // Como o backend: concluida_em é preenchido ao concluir e limpo ao reabrir.
  async function atualizarTarefa(id, mudancas) {
    setTarefas((atuais) =>
      atuais.map((t) => {
        if (t.id !== id) return t
        const status = mudancas.status ?? t.status
        const concluida_em = status === 'concluida' ? (t.concluida_em ?? agora()) : null
        return { ...t, ...mudancas, status, concluida_em }
      }),
    )
  }

  // Como o backend (409): tarefa com Pomodoros não pode ser excluída.
  async function excluirTarefa(id) {
    if (sessoes.some((s) => s.tarefa_id === id)) {
      throw new Error('Esta tarefa possui Pomodoros. Apague-os primeiro.')
    }
    setTarefas((atuais) => atuais.filter((t) => t.id !== id))
  }

  // POST /api/sessoes-pomodoro/iniciar: o início é a hora do servidor e só pode haver
  // uma sessão aberta por vez (409).
  async function iniciarSessao({ tarefa_id, tempo_total_segundos }) {
    if (sessoes.some((s) => !s.fim)) throw new Error('Ja existe uma sessao em andamento.')
    const sessao = {
      id: ++ultimoId,
      usuario_id: 1,
      tarefa_id,
      inicio: agora(),
      fim: null,
      tempo_foco_segundos: null,
      tempo_total_segundos,
    }
    setSessoes((atuais) => [sessao, ...atuais])
    return sessao
  }

  // POST /api/sessoes-pomodoro/<id>/finalizar: como no backend, o fim é a hora do servidor, o total
  // é o tempo decorrido desde o início e o foco informado fica limitado a esse total.
  async function finalizarSessao(id, { tempo_foco_segundos }) {
    const atual = sessoes.find((s) => s.id === id)
    const fim = new Date()
    const total = Math.max(0, Math.round((fim - new Date(atual.inicio)) / 1000))
    const foco = Math.min(Math.max(tempo_foco_segundos, 0), total)
    const sessao = { ...atual, fim: fim.toISOString(), tempo_foco_segundos: foco, tempo_total_segundos: total }
    setSessoes((atuais) => atuais.map((s) => (s.id === id ? sessao : s)))
    return sessao
  }

  const valor = {
    projetos,
    tarefas,
    sessoes,
    criarProjeto,
    criarTarefa,
    atualizarTarefa,
    excluirTarefa,
    iniciarSessao,
    finalizarSessao,
  }
  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>
}

