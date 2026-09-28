import './SessaoIndicador.css'
import { formatarRelogio } from '../home/tempo'
import { EM_CURSO, restanteDe, useAgora, useFoco } from './foco'

const FIM = { 'fim-foco': 'Foco concluído', 'fim-intervalo': 'Intervalo acabou' }

// Atalho na barra do topo para a sessão, visível em qualquer tela enquanto houver uma.
function SessaoIndicador() {
  const { estado } = useFoco()
  const emCurso = EM_CURSO.includes(estado?.fase)
  const agora = useAgora(emCurso)
  if (!estado) return null

  const texto = emCurso ? formatarRelogio(restanteDe(estado, agora)) : FIM[estado.fase]
  const rotulo = emCurso
    ? `${estado.fase === 'foco' ? 'Foco' : 'Intervalo'}: ${texto} restantes. Abrir sessão`
    : `${texto}. Abrir sessão`

  return (
    <a
      className="sessao-ind"
      href="#/foco"
      data-fase={estado.fase}
      data-pausado={estado.parado !== null}
      aria-label={rotulo}
    >
      <span className="sessao-ind-ponto" aria-hidden="true" />
      <span className="sessao-ind-texto">{texto}</span>
    </a>
  )
}

export default SessaoIndicador
