import { createContext, useContext, useEffect, useState } from 'react'
import { formatarDuracao } from '../home/tempo'

export const FocoContext = createContext(null)

export function useFoco() {
  return useContext(FocoContext)
}

export const EM_CURSO = ['foco', 'intervalo']

// Segundos que faltam: congelado enquanto pausado; senão, calculado a partir do horário
// de término (intervalos atrasam em abas de fundo, o relógio não).
export function restanteDe(estado, agora) {
  if (estado.parado !== null) return estado.parado
  const restante = Math.max(0, Math.ceil((estado.fimEm - agora) / 1000))
  return Math.min(restante, duracaoDe(estado))
}

function duracaoDe(estado) {
  return estado.fase === 'intervalo' ? estado.intervaloSeg : estado.focoSeg
}

// Relógio para quem mostra o tempo. Só roda com foco ou intervalo em curso.
export function useAgora(ativo) {
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    if (!ativo) return undefined
    const id = setInterval(() => setAgora(Date.now()), 250)
    return () => clearInterval(id)
  }, [ativo])

  return agora
}

export function minutos(segundos) {
  if (segundos < 60) return 'menos de 1 minuto'
  const min = Math.round(segundos / 60)
  if (min >= 60) return formatarDuracao(min)
  return `${min} ${min === 1 ? 'minuto' : 'minutos'}`
}
