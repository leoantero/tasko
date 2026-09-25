const doisDigitos = (n) => String(n).padStart(2, '0')

export function formatarHora(minutos) {
  return `${doisDigitos(Math.floor(minutos / 60))}:${doisDigitos(minutos % 60)}`
}

export function formatarRelogio(segundos) {
  return `${doisDigitos(Math.floor(segundos / 60))}:${doisDigitos(segundos % 60)}`
}

export function formatarDuracao(minutos) {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return horas ? `${horas}h${doisDigitos(resto)}` : `${resto}min`
}

export function saudacao(minutos) {
  if (minutos < 12 * 60) return 'Bom dia'
  if (minutos < 18 * 60) return 'Boa tarde'
  return 'Boa noite'
}
