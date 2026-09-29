import { useEffect, useState } from 'react'
import * as api from './api'
import { DadosContext } from './dados'
import { sessoesIniciais } from '../features/pomodoro/mockSessoes'

// Fonte única de projetos, tarefas e sessões Pomodoro para todas as telas. Projetos e
// tarefas já vêm da API; as sessões seguem em memória até o próximo commit.

let ultimoId = 1000
const agora = () => new Date().toISOString()

export function DadosProvider({ children }) {
  const [projetos, setProjetos] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [sessoes, setSessoes] = useState(sessoesIniciais)
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')

  // O App só mostra carregando e erro no commit do estado de carga; aqui os
  // valores já ficam no contexto para as telas não renderizarem lista vazia.
  useEffect(() => {
    Promise.all([api.listarProjetos(), api.listarTarefas()])
      .then(([listaProjetos, listaTarefas]) => {
        setProjetos(listaProjetos)
        setTarefas(listaTarefas)
      })
      .catch((erro) => setErroCarga(erro.message))
      .finally(() => setCarregando(false))
  }, [])

  // A resposta traz id, criado_em e status definidos pelo servidor.
  async function criarProjeto(dados) {
    const projeto = await api.criarProjeto(dados)
    setProjetos((atuais) => [projeto, ...atuais])
    return projeto
  }

  async function criarTarefa(dados) {
    const tarefa = await api.criarTarefa(dados)
    setTarefas((atuais) => [tarefa, ...atuais])
    return tarefa
  }

  // A resposta já vem com concluida_em preenchido ou limpo pelo servidor.
  async function atualizarTarefa(id, mudancas) {
    const tarefa = await api.atualizarTarefa(id, mudancas)
    setTarefas((atuais) => atuais.map((t) => (t.id === id ? tarefa : t)))
    return tarefa
  }

  // O backend desvincula as sessões da tarefa em vez de recusar a exclusão.
  async function excluirTarefa(id) {
    await api.excluirTarefa(id)
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
    carregando,
    erroCarga,
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

