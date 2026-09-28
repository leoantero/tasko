import { useFoco } from './foco'

// Ações de cada fase. A chave por fase recria os botões: a tela devolve o foco à ação principal.
function FocoAcoes({ tarefa, primario, onEncerrar, onConcluir, onVoltar }) {
  const foco = useFoco()
  const { estado } = foco
  const pausado = estado.parado !== null
  const principal = (rotulo, onClick) => (
    <button ref={primario} type="button" className="foco-btn foco-btn--primario" onClick={onClick}>
      {rotulo}
    </button>
  )

  return (
    <div className="foco-acoes" key={estado.fase}>
      {estado.fase === 'foco' && (
        <>
          {principal(pausado ? 'Retomar' : 'Pausar', pausado ? foco.retomar : foco.pausar)}
          <button type="button" className="foco-btn" onClick={onEncerrar}>
            Encerrar
          </button>
        </>
      )}
      {estado.fase === 'intervalo' && principal('Pular intervalo', foco.proxima)}
      {estado.fase === 'fim-foco' && (
        <>
          {principal(`Fazer intervalo de ${estado.intervaloSeg / 60} min`, foco.comecarIntervalo)}
          {tarefa?.status === 'pendente' && (
            <button type="button" className="foco-btn" onClick={onConcluir}>
              Concluir tarefa
            </button>
          )}
          <button type="button" className="foco-btn foco-btn--texto" onClick={onVoltar}>
            Voltar ao projeto
          </button>
        </>
      )}
      {estado.fase === 'fim-intervalo' && (
        <>
          {principal(`Começar mais ${estado.focoSeg / 60} min de foco`, foco.proxima)}
          <button type="button" className="foco-btn" onClick={onVoltar}>
            Parar por aqui
          </button>
        </>
      )}
    </div>
  )
}

export default FocoAcoes
