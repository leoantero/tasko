import './AppShell.css'

const LINKS = [
  { rota: 'inicio', href: '#/', rotulo: 'Início' },
  { rota: 'projetos', href: '#/projetos', rotulo: 'Projetos' },
]

function AppShell({ rota, usuario, onSair, children }) {
  return (
    <div className="shell">
      <header className="shell-topbar">
        <a className="shell-brand" href="#/" aria-label="Tasko, ir para o início">
          <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <circle cx="20" cy="20" r="20" />
            <path d="M20 20 V5 A15 15 0 0 1 34 24 Z" className="shell-brand-cut" />
          </svg>
          <span className="shell-brand-nome">Tasko</span>
        </a>

        <nav className="shell-nav" aria-label="Principal">
          {LINKS.map((link) => (
            <a
              key={link.rota}
              href={link.href}
              className="shell-link"
              aria-current={rota === link.rota ? 'page' : undefined}
            >
              {link.rotulo}
            </a>
          ))}
        </nav>

        <div className="shell-user">
          <span className="shell-avatar" aria-hidden="true">
            {usuario.nome[0]}
          </span>
          <button type="button" className="shell-sair" onClick={onSair}>
            Sair
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}

export default AppShell
