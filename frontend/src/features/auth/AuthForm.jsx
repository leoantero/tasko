import { useState } from 'react'
import './AuthForm.css'
import { login } from '../../lib/api'
import { salvarToken } from '../../lib/session'

function AuthForm({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const { token } = await login(email, senha)
      salvarToken(token)
      onAuthenticated(token)
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth-page">
      <aside className="auth-hero">
        <div className="auth-hero-top">
          <span className="auth-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="20" />
              <path d="M20 20 V5 A15 15 0 0 1 34 24 Z" className="auth-mark-cut" />
            </svg>
          </span>
          <div>
            <h1 className="auth-wordmark">Tasko</h1>
            <p className="auth-tagline">Clareza para focar, ritmo para produzir.</p>
          </div>
        </div>

        <ul className="auth-hero-features">
          <li>
            <span className="auth-hero-dot auth-hero-dot--brand" aria-hidden="true" />
            Sessões de foco com Pomodoro
          </li>
          <li>
            <span className="auth-hero-dot auth-hero-dot--accent" aria-hidden="true" />
            Metas e progresso acompanhados
          </li>
          <li>
            <span className="auth-hero-dot auth-hero-dot--low" aria-hidden="true" />
            Projetos organizados, prazos claros
          </li>
        </ul>

        <svg className="auth-hero-pattern" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          <path d="M 360 40 A 320 320 0 0 1 40 360" />
          <path d="M 360 140 A 220 220 0 0 1 140 360" />
          <path d="M 360 240 A 120 120 0 0 1 240 360" />
        </svg>
      </aside>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={enviar}>
          <h2 className="auth-card-label">Entrar</h2>

          <label className="auth-field">
            <span>Email</span>
            <span className="auth-input-wrap">
              <input
                type="email"
                name="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                required
              />
              <svg className="auth-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M3 5.5h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
                <path d="m3 6 7 5 7-5" />
              </svg>
            </span>
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <span className="auth-input-wrap">
              <input
                type="password"
                name="senha"
                placeholder="********"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                required
                minLength={6}
              />
              <svg className="auth-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <rect x="4.5" y="9" width="11" height="8" rx="2" />
                <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
              </svg>
            </span>
          </label>

          {erro && <p className="auth-error">{erro}</p>}

          <button type="submit" className="auth-submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AuthForm
