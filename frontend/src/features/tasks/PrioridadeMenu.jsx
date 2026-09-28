import { useEffect, useRef, useState } from 'react'
import './Prioridade.css'
import { NOME_PRIORIDADE, PRIORIDADES, rotuloPrioridade } from './tarefas'

// Botão com bandeira na linha da tarefa: abre um menu para trocar a prioridade sem sair da lista.
function PrioridadeMenu({ valor, titulo, onEscolher }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)
  const botao = useRef(null)

  // Ao abrir, o foco vai para a opção marcada; clicar fora fecha.
  useEffect(() => {
    if (!aberto) return undefined
    raiz.current.querySelector('[aria-checked="true"]').focus()
    function fora(evento) {
      if (!raiz.current.contains(evento.target)) setAberto(false)
    }
    document.addEventListener('pointerdown', fora)
    return () => document.removeEventListener('pointerdown', fora)
  }, [aberto])

  function fechar() {
    setAberto(false)
    botao.current.focus()
  }

  function teclado(evento) {
    const itens = [...raiz.current.querySelectorAll('[role="menuitemradio"]')]
    const atual = itens.indexOf(document.activeElement)
    const destino = { ArrowDown: atual + 1, ArrowUp: atual - 1, Home: 0, End: itens.length - 1 }[evento.key]
    if (destino !== undefined) {
      evento.preventDefault()
      itens[(destino + itens.length) % itens.length].focus()
    } else if (evento.key === 'Escape') {
      evento.preventDefault()
      fechar()
    } else if (evento.key === 'Tab') {
      setAberto(false)
    }
  }

  function escolher(novo) {
    fechar()
    if (novo !== valor) onEscolher(novo)
  }

  return (
    <div className="prio-menu" ref={raiz}>
      <button
        ref={botao}
        type="button"
        className="task-item-acao prio-bandeira"
        data-prioridade={valor ?? 0}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`${rotuloPrioridade(valor)}. Alterar prioridade: ${titulo}`}
        title={rotuloPrioridade(valor)}
        onClick={() => setAberto((v) => !v)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M5 17.5V3" />
          <path className="prio-bandeira-pano" d="M5 3.5h9.5l-2 3.75 2 3.75H5z" />
        </svg>
      </button>

      {aberto && (
        <div className="prio-menu-lista" role="menu" aria-label="Prioridade" onKeyDown={teclado}>
          {PRIORIDADES.map((opcao) => (
            <button
              key={opcao ?? 0}
              type="button"
              role="menuitemradio"
              aria-checked={opcao === valor}
              tabIndex={-1}
              className="prio-menu-item"
              onClick={() => escolher(opcao)}
            >
              <span className={`prio-ponto prio-ponto--${opcao ?? 0}`} aria-hidden="true" />
              {opcao ? NOME_PRIORIDADE[opcao] : 'Sem prioridade'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PrioridadeMenu
