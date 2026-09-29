import { useEffect, useState } from 'react'
import { resumoDashboard } from '../../lib/api'

function DashboardScreen() {
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    resumoDashboard()
      .then((dados) => ativo && setResumo(dados))
      .catch((falha) => ativo && setErro(falha.message))
    return () => {
      ativo = false
    }
  }, [])

  if (erro) {
    return (
      <main className="app-estado" role="alert">
        <strong>Não foi possível carregar o dashboard.</strong>
        <p>{erro}</p>
      </main>
    )
  }

  if (!resumo) {
    return <main className="app-estado" aria-live="polite">Carregando dashboard…</main>
  }

  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  )
}

export default DashboardScreen