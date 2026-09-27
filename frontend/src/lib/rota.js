import { useEffect, useState } from 'react'

const lerRota = () => window.location.hash.replace(/^#\/?/, '') || 'inicio'

export function useRota() {
  const [rota, setRota] = useState(lerRota)

  useEffect(() => {
    const aoMudar = () => setRota(lerRota())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  return rota
}
