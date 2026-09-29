import { useEffect, useState } from 'react'
import AuthForm from './features/auth/AuthForm.jsx'
import HomeScreen from './features/home/HomeScreen.jsx'
import AppShell from './features/layout/AppShell.jsx'
import ProjectDetailScreen from './features/projects/ProjectDetailScreen.jsx'
import ProjectsScreen from './features/projects/ProjectsScreen.jsx'
import FocusScreen from './features/pomodoro/FocusScreen.jsx'
import { FocoProvider } from './features/pomodoro/FocoProvider.jsx'
import { perfil } from './lib/api'
import { DadosProvider } from './lib/DadosProvider.jsx'
import { useDados } from './lib/dados'
import { useRota } from './lib/rota'
import { limparToken, obterToken } from './lib/session'

function lerTela(rota) {
  const [secao, id] = rota.split('/')
  if (secao === 'foco') return { tela: 'foco' }
  if (secao !== 'projetos') return { tela: 'inicio' }
  return id ? { tela: 'projeto', projetoId: Number(id) } : { tela: 'projetos' }
}

// Enquanto a carga inicial não termina, as telas mostrariam listas vazias como se
// a conta não tivesse nada; se a API não responde, o erro precisa aparecer.
function Conteudo({ children }) {
  const { carregando, erroCarga } = useDados()

  if (carregando) return <main className="app-estado">Carregando seus dados…</main>
  if (erroCarga) {
    return (
      <main className="app-estado">
        <strong>Não foi possível carregar seus dados.</strong>
        <p>{erroCarga}</p>
      </main>
    )
  }
  return children
}

function App() {
  const [token, setToken] = useState(() => obterToken())
  const [usuario, setUsuario] = useState(null)
  const { tela, projetoId } = lerTela(useRota())

  // O detalhe do projeto e a sessão de foco definem o próprio título (nome do projeto, timer).
  useEffect(() => {
    const titulos = { inicio: 'Início', projetos: 'Projetos' }
    if (!token) document.title = 'Entrar · Tasko'
    else if (titulos[tela]) document.title = `${titulos[tela]} · Tasko`
  }, [token, tela])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tela, projetoId])

  // O api.js avisa quando alguma rota responde 401; o token ja foi limpo la.
  useEffect(() => {
    const aoExpirar = () => {
      setToken(null)
      setUsuario(null)
    }
    window.addEventListener('sessao-expirada', aoExpirar)
    return () => window.removeEventListener('sessao-expirada', aoExpirar)
  }, [])

  // O nome exibido vem do dono do token; token invalido ou expirado derruba a sessao.
  useEffect(() => {
    if (!token) return
    let ativo = true
    perfil()
      .then((dados) => ativo && setUsuario(dados))
      .catch(() => ativo && sair())
    return () => {
      ativo = false
    }
  }, [token])

  function sair() {
    limparToken()
    setToken(null)
    setUsuario(null)
  }

  if (!token) {
    return <AuthForm onAuthenticated={setToken} />
  }

  if (!usuario) return null

  return (
    <DadosProvider>
      <FocoProvider>
        <AppShell rota={tela === 'projeto' ? 'projetos' : tela} usuario={usuario} onSair={sair}>
          <Conteudo>
            {tela === 'inicio' && <HomeScreen usuario={usuario} />}
            {tela === 'projetos' && <ProjectsScreen />}
            {tela === 'projeto' && <ProjectDetailScreen key={projetoId} projetoId={projetoId} />}
            {tela === 'foco' && <FocusScreen />}
          </Conteudo>
        </AppShell>
      </FocoProvider>
    </DadosProvider>
  )
}

export default App
