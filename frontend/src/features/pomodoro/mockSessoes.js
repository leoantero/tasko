// Mesmo formato de GET /api/sessoes-pomodoro. tempo_total_segundos é o tempo decorrido entre
// início e fim (calculado pelo servidor); tempo_foco_segundos é o focado, sem as pausas.
const sessao = (id, tarefa_id, haDias, hora, focoMin, totalMin = focoMin) => {
  let inicio = new Date()
  inicio.setDate(inicio.getDate() - haDias)
  inicio.setHours(hora, 0, 0, 0)
  // Sessão "de hoje" num horário que ainda não chegou: puxa para antes de agora.
  const limite = Date.now() - (totalMin + 5) * 60 * 1000
  if (inicio.getTime() > limite) inicio = new Date(limite)
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

// Uma semana de uso, concentrada no TP (projeto 1) e em Cálculo II (projeto 2).
// A 16 fica fora da janela de 7 dias; a 8 e a 12 foram encerradas antes do tempo.
export const sessoesIniciais = [
  sessao(1, 1, 6, 9, 25),
  sessao(2, 7, 5, 14, 25),
  sessao(3, 7, 5, 15, 25),
  sessao(4, 1, 4, 10, 50),
  sessao(5, 8, 4, 16, 50),
  sessao(6, 14, 4, 19, 15),
  sessao(7, 2, 3, 9, 25),
  sessao(8, 12, 3, 21, 18, 25),
  sessao(9, 1, 2, 20, 25),
  sessao(10, 9, 2, 15, 25),
  sessao(11, 1, 1, 9, 25),
  sessao(12, 3, 1, 10, 18, 25),
  sessao(13, 1, 1, 11, 25),
  sessao(14, 1, 0, 8, 25),
  sessao(15, 8, 0, 11, 25),
  sessao(16, 6, 9, 14, 25),
]
