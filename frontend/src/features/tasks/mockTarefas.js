import { somarDias } from '../projects/datas'

const haDias = (dias) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()

// Mesmo formato de GET /api/tarefas. Prioridade: 3 alta, 2 média, 1 baixa, null sem prioridade.
const pendente = (id, projeto_id, titulo, prioridade, prazoEmDias, extra = {}) => ({
  id,
  projeto_id,
  titulo,
  descricao: null,
  prioridade,
  prazo: prazoEmDias === null ? null : somarDias(prazoEmDias),
  status: 'pendente',
  criado_em: haDias(10 + id),
  concluida_em: null,
  ...extra,
})

const concluida = (id, projeto_id, titulo, concluidaHaDias) => ({
  ...pendente(id, projeto_id, titulo, null, null),
  status: 'concluida',
  concluida_em: haDias(concluidaHaDias),
})

export const tarefasIniciais = [
  pendente(1, 1, 'Implementar tela de tarefas (HU02)', 3, 2, {
    descricao: 'Criar, editar, concluir e excluir tarefas dentro de um projeto.',
  }),
  pendente(2, 1, 'Revisar diagrama de classes do README', 2, -1),
  pendente(3, 1, 'Preparar slides sobre uso de IA', 2, 10, {
    descricao: 'Pontos positivos e negativos, dicas e % de código gerado.',
  }),
  pendente(4, 1, 'Enviar formulário de presença do grupo', 1, null),
  concluida(5, 1, 'Configurar Vite e tokens do design system', 20),
  concluida(6, 1, 'Tela de login (HU09)', 6),
  concluida(7, 1, 'Tela inicial (HU10)', 2),
  pendente(8, 2, 'Lista 4 — exercícios 1 a 6', 3, 1),
  pendente(9, 2, 'Revisar integração por partes', 2, 4),
  concluida(10, 2, 'Lista 3 — exercícios 1 a 8', 5),
  concluida(11, 3, 'Escolher template do site', 7),
  pendente(12, 3, 'Escrever a seção "Sobre mim"', null, null),
  pendente(13, 3, 'Publicar no GitHub Pages', 1, 40),
  pendente(14, 4, 'Simulado de listening', 2, -3),
  pendente(15, 4, 'Revisar phrasal verbs', null, null),
  pendente(16, 5, 'Corrigir listas da turma B', 2, 2),
  concluida(17, 5, 'Plantão de dúvidas de quinta', 1),
  concluida(18, 6, 'Implementar escalonador round-robin', 12),
  concluida(19, 6, 'Relatório final do trabalho', 9),
  concluida(20, 7, 'Montar planilha de gastos do mês', 16),
]
