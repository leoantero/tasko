import { useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import HomeScreen from './features/home/HomeScreen.jsx'
import { usuario } from './features/home/mockData'
import AppShell from './features/layout/AppShell.jsx'
import ProjectsScreen from './features/projects/ProjectsScreen.jsx'
import { useRota } from './lib/rota'
import { limparToken, obterToken } from './lib/session'

function App() {
  const [token, setToken] = useState(() => obterToken())
  const tela = useRota() === 'projetos' ? 'projetos' : 'inicio'

  function sair() {
    limparToken()
    setToken(null)
  }

  if (!token) {
    return <AuthForm onAuthenticated={setToken} />
  }

  return (
    <AppShell rota={tela} usuario={usuario} onSair={sair}>
      {tela === 'projetos' ? <ProjectsScreen /> : <HomeScreen />}
    </AppShell>
  )
}

export default App
