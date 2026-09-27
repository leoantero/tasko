import { useEffect, useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import HomeScreen from './features/home/HomeScreen.jsx'
import { usuario } from './features/home/mockData'
import AppShell from './features/layout/AppShell.jsx'
import ProjectDetailScreen from './features/projects/ProjectDetailScreen.jsx'
import ProjectsScreen from './features/projects/ProjectsScreen.jsx'
import { DadosProvider } from './lib/DadosProvider.jsx'
import { useRota } from './lib/rota'
import { limparToken, obterToken } from './lib/session'

function lerTela(rota) {
  const [secao, id] = rota.split('/')
  if (secao !== 'projetos') return { tela: 'inicio' }
  return id ? { tela: 'projeto', projetoId: Number(id) } : { tela: 'projetos' }
}

function App() {
  const [token, setToken] = useState(() => obterToken())
  const { tela, projetoId } = lerTela(useRota())

  // O detalhe do projeto define o próprio título (usa o nome do projeto).
  useEffect(() => {
    const titulos = { inicio: 'Início', projetos: 'Projetos' }
    if (!token) document.title = 'Entrar · Tasko'
    else if (titulos[tela]) document.title = `${titulos[tela]} · Tasko`
  }, [token, tela])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tela, projetoId])

  function sair() {
    limparToken()
    setToken(null)
  }

  if (!token) {
    return <AuthForm onAuthenticated={setToken} />
  }

  return (
    <DadosProvider>
      <AppShell rota={tela === 'inicio' ? 'inicio' : 'projetos'} usuario={usuario} onSair={sair}>
        {tela === 'inicio' && <HomeScreen />}
        {tela === 'projetos' && <ProjectsScreen />}
        {tela === 'projeto' && <ProjectDetailScreen key={projetoId} projetoId={projetoId} />}
      </AppShell>
    </DadosProvider>
  )
}

export default App
