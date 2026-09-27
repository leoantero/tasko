import { useId, useLayoutEffect, useRef } from 'react'

// <dialog> modal nativo: prende o foco, fecha no Esc e escurece o fundo.
// Para fechar, o pai desmonta o Dialogo (via onFechar).
function Dialogo({ titulo, onFechar, largura = 'media', children }) {
  const dialogo = useRef(null)
  const id = useId()

  useLayoutEffect(() => {
    const el = dialogo.current
    if (!el.open) el.showModal()
    el.querySelector('[data-autofocus]')?.focus()
    // Roda antes de o <dialog> sair do DOM: close() devolve o foco a quem abriu.
    return () => {
      if (el.open) el.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogo}
      className={`dialogo dialogo--${largura}`}
      aria-labelledby={`${id}-titulo`}
      // O evento "close" é assíncrono: no StrictMode ele chega depois de o diálogo já
      // ter sido reaberto pela remontagem; só avisa o pai se ele continua fechado (Esc).
      onClose={(evento) => !evento.currentTarget.open && onFechar()}
      onClick={(evento) => evento.target === evento.currentTarget && onFechar()}
    >
      <div className="dialogo-corpo">
        <header className="dialogo-head">
          <h2 id={`${id}-titulo`}>{titulo}</h2>
          <button type="button" className="dialogo-fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}

export default Dialogo
