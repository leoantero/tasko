import { diasAte, formatarData, lerData } from '../projects/datas'

// Valores da API: 3 alta, 2 média, 1 baixa, null sem prioridade (mesma ordem de exibição).
export const PRIORIDADES = [3, 2, 1, null]
export const NOME_PRIORIDADE = { 3: 'Alta', 2: 'Média', 1: 'Baixa' }

export function rotuloPrioridade(valor) {
  return valor ? `Prioridade ${NOME_PRIORIDADE[valor].toLowerCase()}` : 'Sem prioridade'
}

export function situacaoTarefa(tarefa, hoje = new Date()) {
  if (tarefa.status === 'concluida') {
    return { tipo: 'concluida', rotulo: `concluída em ${formatarData(new Date(tarefa.concluida_em))}` }
  }
  if (!tarefa.prazo) return { tipo: 'sem-prazo', rotulo: 'sem prazo' }

  const dias = diasAte(tarefa.prazo, hoje)
  if (dias < 0) return { tipo: 'atrasada', rotulo: `atrasada há ${-dias} ${dias === -1 ? 'dia' : 'dias'}` }
  if (dias === 0) return { tipo: 'urgente', rotulo: 'vence hoje' }
  if (dias === 1) return { tipo: 'urgente', rotulo: 'vence amanhã' }
  if (dias <= 7) return { tipo: 'urgente', rotulo: `vence em ${dias} dias` }
  return { tipo: 'ok', rotulo: `até ${formatarData(lerData(tarefa.prazo))}` }
}

// Mesma ordem de GET /api/tarefas: prioridade maior, prazo mais próximo, mais recente.
export function ordenarPendentes(a, b) {
  const prioridade = (b.prioridade ?? 0) - (a.prioridade ?? 0)
  if (prioridade) return prioridade
  if (a.prazo && b.prazo) {
    const prazo = lerData(a.prazo) - lerData(b.prazo)
    if (prazo) return prazo
  } else if (a.prazo || b.prazo) {
    return a.prazo ? -1 : 1
  }
  return new Date(b.criado_em) - new Date(a.criado_em)
}

export function ordenarConcluidas(a, b) {
  return new Date(b.concluida_em) - new Date(a.concluida_em)
}
