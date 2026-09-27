import { useEffect, useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import HomeScreen from './features/home/HomeScreen.jsx'
import { usuario } from './features/home/mockData'
import AppShell from './features/layout/AppShell.jsx'
import ProjectsScreen from './features/projects/ProjectsScreen.jsx'
import { DadosProvider } from './lib/DadosProvider.jsx'
import { useRota } from './lib/rota'
import { limparToken, obterToken } from './lib/session'

function App() {
  const [token, setToken] = useState(() => obterToken())
  const tela = useRota() === 'projetos' ? 'projetos' : 'inicio'

  useEffect(() => {
    const titulos = { inicio: 'Início', projetos: 'Projetos' }
    document.title = `${token ? titulos[tela] : 'Entrar'} · Tasko`
  }, [token, tela])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tela])

  function sair() {
    limparToken()
    setToken(null)
  }

  if (!token) {
    return <AuthForm onAuthenticated={setToken} />
  }

  return (
    <DadosProvider>
      <AppShell rota={tela} usuario={usuario} onSair={sair}>
        {tela === 'projetos' ? <ProjectsScreen /> : <HomeScreen />}
      </AppShell>
    </DadosProvider>
  )
}

export default App
