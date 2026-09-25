const min = (h, m = 0) => h * 60 + m

export const usuario = { nome: 'Leonardo' }

export const AGORA_MIN = min(14, 20)

export const sessaoAtual = {
  tarefaId: 2,
  inicio: min(14, 8),
  duracaoSeg: 25 * 60,
  restanteSeg: 13 * 60 + 23,
  ciclo: 3,
  ciclosTotal: 4,
}

export const tarefasHoje = [
  { id: 1, titulo: 'Revisar diagrama de classes do README', projeto: 'TP Eng. Software', prioridade: 'alta', prazo: min(10), concluida: true },
  { id: 2, titulo: 'Implementar tela inicial (HU10)', projeto: 'TP Eng. Software', prioridade: 'alta', prazo: min(16), concluida: false },
  { id: 3, titulo: 'Enviar formulário de presença do grupo', projeto: 'TP Eng. Software', prioridade: 'media', prazo: min(12), concluida: false },
  { id: 4, titulo: 'Lista 4 de Cálculo II — exercícios 1 a 6', projeto: 'Cálculo II', prioridade: 'media', prazo: min(18), concluida: false },
  { id: 5, titulo: 'Preparar slides sobre uso de IA', projeto: 'TP Eng. Software', prioridade: 'media', prazo: min(19), concluida: false },
  { id: 6, titulo: 'Ler capítulo 3 de Sistemas Operacionais', projeto: 'Sistemas Operacionais', prioridade: 'baixa', prazo: min(20), concluida: false },
  { id: 7, titulo: 'Responder dúvidas no fórum da disciplina', projeto: 'Redes', prioridade: 'baixa', prazo: min(11, 30), concluida: true },
  { id: 8, titulo: 'Atualizar branch local com a main', projeto: 'TP Eng. Software', prioridade: 'baixa', prazo: min(9), concluida: true },
]

export const blocosHoje = [
  { inicio: min(8, 30), fim: min(8, 55), tipo: 'foco' },
  { inicio: min(8, 55), fim: min(9), tipo: 'pausa' },
  { inicio: min(9), fim: min(9, 25), tipo: 'foco' },
  { inicio: min(9, 25), fim: min(9, 30), tipo: 'pausa' },
  { inicio: min(9, 30), fim: min(9, 55), tipo: 'foco' },
  { inicio: min(9, 55), fim: min(10), tipo: 'pausa' },
  { inicio: min(10), fim: min(10, 25), tipo: 'foco' },
  { inicio: min(10, 25), fim: min(10, 45), tipo: 'pausa' },
  { inicio: min(11), fim: min(11, 25), tipo: 'foco' },
  { inicio: min(13, 10), fim: min(13, 35), tipo: 'foco' },
  { inicio: min(13, 35), fim: min(13, 40), tipo: 'pausa' },
  { inicio: min(13, 40), fim: min(14, 5), tipo: 'foco' },
  { inicio: min(14, 5), fim: min(14, 8), tipo: 'pausa' },
]
