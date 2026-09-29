import './PerfilScreen.css'

// HU09: dados da conta, só leitura. O usuário já está em memória desde o login
// (GET /perfil no App), então a tela não faz requisição própria.
function PerfilScreen({ usuario }) {
  const desde = new Date(usuario.criado_em).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="perfil">
      <header className="perfil-head">
        <span className="perfil-avatar" aria-hidden="true">
          {usuario.nome[0]}
        </span>
        <div>
          <h1>{usuario.nome}</h1>
          <p className="perfil-desde">Na Tasko desde {desde}</p>
        </div>
      </header>

      <dl className="perfil-dados">
        <div className="perfil-item">
          <dt>Nome</dt>
          <dd>{usuario.nome}</dd>
        </div>
        <div className="perfil-item">
          <dt>Email</dt>
          <dd>{usuario.email}</dd>
        </div>
        <div className="perfil-item">
          <dt>ID da conta</dt>
          <dd className="perfil-id">{usuario.id}</dd>
        </div>
      </dl>

      <p className="perfil-nota">
        Para alterar nome, email ou senha, fale com o time: a edição ainda não existe.
      </p>
    </main>
  )
}

export default PerfilScreen
