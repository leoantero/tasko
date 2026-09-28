import { EM_CURSO } from '../pomodoro/foco'

// Estados do cartão de foco da tela inicial, derivados do FocoProvider.
export const ROTULO = {
  focando: 'Focando agora',
  pausada: 'Sessão pausada',
  intervalo: 'Intervalo',
  concluida: 'Sessão concluída',
  livre: 'Nenhuma sessão em andamento',
}

export function tipoDe(estado) {
  if (!estado) return 'livre'
  if (estado.fase === 'foco') return estado.parado !== null ? 'pausada' : 'focando'
  return estado.fase === 'intervalo' ? 'intervalo' : 'concluida'
}

// Segundos no centro do anel, legenda e quanto do anel está preenchido.
export function mostradorDe(estado, restante, tempos) {
  if (!estado) return [tempos.focoSeg, 'pronto para começar', 0]
  if (!EM_CURSO.includes(estado.fase)) return [estado.focadoSeg, 'focados', estado.focadoSeg / estado.focoSeg]
  const duracao = estado.fase === 'intervalo' ? estado.intervaloSeg : estado.focoSeg
  return [restante, estado.fase === 'intervalo' ? 'de intervalo' : 'restantes', 1 - restante / duracao]
}
