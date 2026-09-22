import './AuthForm.css'

function AuthForm() {
  return (
    <main className="auth-page">
      <header className="auth-brand">
        <h1 className="auth-wordmark">Tasko</h1>
        <p className="auth-tagline">Clareza para focar, ritmo para produzir.</p>
      </header>

      <form className="auth-card">
        <h2 className="auth-card-label">Entrar</h2>

        <label className="auth-field">
          <span>Email</span>
          <input type="email" name="email" placeholder="voce@exemplo.com" />
        </label>

        <label className="auth-field">
          <span>Senha</span>
          <input type="password" name="senha" placeholder="********" />
        </label>

        <button type="submit" className="auth-submit">
          Entrar
        </button>
      </form>
    </main>
  )
}

export default AuthForm
