import { useEffect, useState } from 'react'
import * as api from './api'
import { DadosContext } from './dados'

// Fonte única de projetos, tarefas e sessões Pomodoro para todas as telas. Cada ação
// chama a API e guarda no estado o objeto devolvido pelo servidor.

export function DadosProvider({ children }) {
  const [projetos, setProjetos] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [sessoes, setSessoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')

  // O App só mostra carregando e erro no commit do estado de carga; aqui os
  // valores já ficam no contexto para as telas não renderizarem lista vazia.
  useEffect(() => {
    Promise.all([api.listarProjetos(), api.listarTarefas(), api.listarSessoes()])
      .then(([listaProjetos, listaTarefas, listaSessoes]) => {
        setProjetos(listaProjetos)
        setTarefas(listaTarefas)
        setSessoes(listaSessoes)
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

  // Sessão que ficou aberta, para o FocoProvider retomar o timer ao abrir o app.
  function buscarSessaoAberta() {
    return api.sessaoAtual()
  }

  // O servidor define o início e recusa com 409 se já houver sessão aberta.
  async function iniciarSessao(dados) {
    const sessao = await api.iniciarSessao(dados)
    setSessoes((atuais) => [sessao, ...atuais])
    return sessao
  }

  // O fim, o tempo total e o limite do tempo focado vêm do servidor.
  async function finalizarSessao(id, dados) {
    const sessao = await api.finalizarSessao(id, dados)
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
    buscarSessaoAberta,
    iniciarSessao,
    finalizarSessao,
  }
  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>
}

