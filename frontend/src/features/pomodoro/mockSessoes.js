// Mesmo formato de GET /api/sessoes-pomodoro. tempo_total_segundos é o tempo decorrido entre
// início e fim (calculado pelo servidor); tempo_foco_segundos é o focado, sem as pausas.
const sessao = (id, tarefa_id, haDias, hora, focoMin, totalMin = focoMin) => {
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - haDias)
  inicio.setHours(hora, 0, 0, 0)
  return {
    id,
    usuario_id: 1,
    tarefa_id,
    inicio: inicio.toISOString(),
    fim: new Date(inicio.getTime() + totalMin * 60 * 1000).toISOString(),
    tempo_foco_segundos: focoMin * 60,
    tempo_total_segundos: totalMin * 60,
  }
}

export const sessoesIniciais = [
  sessao(1, 1, 1, 9, 25),
  sessao(2, 1, 1, 10, 25),
  sessao(3, 1, 0, 8, 18, 25),
  sessao(4, 8, 2, 14, 50),
  sessao(5, 6, 6, 15, 25),
]
