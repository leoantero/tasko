// Mesmo formato de GET /api/sessoes-pomodoro. tempo_total_segundos é a duração escolhida
// ao iniciar; tempo_foco_segundos é quanto foi focado de fato (menos, se encerrada antes).
const sessao = (id, tarefa_id, haDias, hora, focoMin, totalMin = focoMin) => {
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - haDias)
  inicio.setHours(hora, 0, 0, 0)
  return {
    id,
    usuario_id: 1,
    tarefa_id,
    inicio: inicio.toISOString(),
    fim: new Date(inicio.getTime() + focoMin * 60 * 1000).toISOString(),
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
