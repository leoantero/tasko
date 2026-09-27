import { useState } from 'react'
import { DadosContext } from './dados'
import { projetosIniciais } from '../features/projects/mockProjetos'
import { tarefasIniciais } from '../features/tasks/mockTarefas'

// Fonte única de projetos e tarefas para todas as telas. Hoje em memória (mock);
// na integração, cada ação passa a chamar a API e as telas não mudam.

let ultimoId = 1000
const agora = () => new Date().toISOString()

export function DadosProvider({ children }) {
  const [projetos, setProjetos] = useState(projetosIniciais)
  const [tarefas, setTarefas] = useState(tarefasIniciais)

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

  async function excluirTarefa(id) {
    setTarefas((atuais) => atuais.filter((t) => t.id !== id))
  }

  const valor = { projetos, tarefas, criarProjeto, criarTarefa, atualizarTarefa, excluirTarefa }
  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>
}

