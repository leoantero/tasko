import { useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import { obterToken } from './lib/session'

function App() {
  const [token, setToken] = useState(() => obterToken())

  if (!token) {
    return <AuthForm onAuthenticated={setToken} />
  }

  return null
}

export default App
