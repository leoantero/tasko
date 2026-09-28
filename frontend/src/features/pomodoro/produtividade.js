import { formatarDuracao } from '../home/tempo'

// Contas da HU05 sobre as sessões registradas (formato de GET /api/sessoes-pomodoro).
// Só contam as finalizadas: a sessão em curso ainda não tem tempo de foco.

export function focoPorTarefa(sessoes) {
  const total = new Map()
  for (const s of sessoes) {
    if (!s.fim) continue
    total.set(s.tarefa_id, (total.get(s.tarefa_id) ?? 0) + (s.tempo_foco_segundos ?? 0))
  }
  return total
}

// Soma por dia (no fuso de quem usa) dos últimos `dias` dias, terminando hoje.
export function focoPorDia(sessoes, dias = 7, hoje = new Date()) {
  const inicioDoDia = (data) => new Date(data.getFullYear(), data.getMonth(), data.getDate())
  const base = inicioDoDia(hoje)
  const serie = Array.from({ length: dias }, (_, i) => ({
    data: new Date(base.getFullYear(), base.getMonth(), base.getDate() - (dias - 1 - i)),
    segundos: 0,
  }))
  for (const s of sessoes) {
    if (!s.fim) continue
    const indice = Math.round((inicioDoDia(new Date(s.inicio)) - serie[0].data) / 86400000)
    if (indice >= 0 && indice < dias) serie[indice].segundos += s.tempo_foco_segundos ?? 0
  }
  return serie
}

// "0min", "<1min", "25min", "1h08"
export function duracaoCurta(segundos) {
  if (segundos > 0 && segundos < 60) return '<1min'
  return formatarDuracao(Math.round(segundos / 60))
}

export function ehHoje(valor, hoje = new Date()) {
  return Boolean(valor) && new Date(valor).toDateString() === hoje.toDateString()
}
