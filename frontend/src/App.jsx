import { useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import { limparToken, obterToken } from './lib/session'

function App() {
  const [token, setToken] = useState(() => obterToken())

  function sair() {
    limparToken()
    setToken(null)
  }

  if (!token) {
    return <AuthForm onAuthenticated={setToken} />
  }

  return (
    <main className="app-placeholder">
      <p>Login realizado com sucesso.</p>
      <p>A tela inicial (HU10) ainda não foi implementada.</p>
      <button onClick={sair}>Sair</button>
    </main>
  )
}

export default App
