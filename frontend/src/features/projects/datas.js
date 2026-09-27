const DIA_MS = 24 * 60 * 60 * 1000
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// "2026-10-08" com new Date() vira meia-noite UTC, que no Brasil é o dia anterior.
export function lerData(iso) {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

export function somarDias(dias, base = new Date()) {
  const data = inicioDoDia(base)
  data.setDate(data.getDate() + dias)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

export function diasAte(iso, hoje = new Date()) {
  return Math.round((lerData(iso) - inicioDoDia(hoje)) / DIA_MS)
}

export function formatarData(data) {
  const valor = typeof data === 'string' && data.length === 10 ? lerData(data) : new Date(data)
  return `${valor.getDate()} ${MESES[valor.getMonth()]}`
}

const plural = (n, singular, varios) => `${n} ${n === 1 ? singular : varios}`

export function situacaoPrazo(projeto, hoje = new Date()) {
  if (projeto.status === 'concluido') {
    return { tipo: 'concluido', rotulo: `concluído em ${formatarData(projeto.concluido_em)}` }
  }
  if (!projeto.prazo) return { tipo: 'sem-prazo', rotulo: 'sem prazo' }

  const dias = diasAte(projeto.prazo, hoje)
  if (dias < 0) return { tipo: 'atrasado', rotulo: `atrasado há ${plural(-dias, 'dia', 'dias')}` }
  if (dias === 0) return { tipo: 'urgente', rotulo: 'vence hoje' }
  if (dias === 1) return { tipo: 'urgente', rotulo: 'vence amanhã' }
  return { tipo: dias <= 7 ? 'urgente' : 'ok', rotulo: `faltam ${dias} dias` }
}

export function progressoPrazo(projeto, hoje = new Date()) {
  if (projeto.status === 'concluido') return 1
  if (!projeto.prazo) return null

  const inicio = inicioDoDia(new Date(projeto.criado_em))
  const total = lerData(projeto.prazo) - inicio
  if (total <= 0) return 1
  return Math.min(1, Math.max(0, (inicioDoDia(hoje) - inicio) / total))
}
