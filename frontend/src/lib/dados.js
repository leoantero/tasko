import { createContext, useContext } from 'react'

export const DadosContext = createContext(null)

export function useDados() {
  return useContext(DadosContext)
}
