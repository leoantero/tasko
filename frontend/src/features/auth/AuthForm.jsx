import './AuthForm.css'

function AuthForm() {
  return (
    <main className="auth-page">
      <form className="auth-card">
        <h1 className="auth-title">Entrar no Tasko</h1>

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
