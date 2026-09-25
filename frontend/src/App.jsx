import { useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import HomeScreen from './features/home/HomeScreen.jsx'
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

  return <HomeScreen onSair={sair} />
}

export default App
