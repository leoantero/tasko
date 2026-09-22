import './AuthForm.css'

function AuthForm() {
  return (
    <main className="auth-page">
      <svg className="auth-ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <path d="M 180 20 A 160 160 0 0 1 20 180" />
        <path d="M 180 70 A 110 110 0 0 1 70 180" />
        <path d="M 180 120 A 60 60 0 0 1 120 180" />
      </svg>

      <header className="auth-brand">
        <h1 className="auth-wordmark">Tasko</h1>
        <p className="auth-tagline">Clareza para focar, ritmo para produzir.</p>
      </header>

      <form className="auth-card">
        <h2 className="auth-card-label">Entrar</h2>

        <label className="auth-field">
          <span>Email</span>
          <span className="auth-input-wrap">
            <input type="email" name="email" placeholder="voce@exemplo.com" />
            <svg className="auth-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M3 5.5h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
              <path d="m3 6 7 5 7-5" />
            </svg>
          </span>
        </label>

        <label className="auth-field">
          <span>Senha</span>
          <span className="auth-input-wrap">
            <input type="password" name="senha" placeholder="********" />
            <svg className="auth-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <rect x="4.5" y="9" width="11" height="8" rx="2" />
              <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
            </svg>
          </span>
        </label>

        <button type="submit" className="auth-submit">
          Entrar
        </button>
      </form>
    </main>
  )
}

export default AuthForm
