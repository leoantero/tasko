import { useState } from 'react'
import Dialogo from '../../components/Dialogo.jsx'
import CampoMinutos from './CampoMinutos.jsx'
import { useFoco } from './foco'

const LIMITE = { foco: 120, intervalo: 60 }

function lerMinutos(texto, max) {
  const n = Number(texto)
  return texto !== '' && Number.isInteger(n) && n >= 1 && n <= max ? n : null
}

// Escolha dos tempos de foco e de intervalo antes de começar a sessão.
function IniciarSessao({ tarefa, onFechar }) {
  const { tempos, comecar } = useFoco()
  const [foco, setFoco] = useState(String(tempos.focoSeg / 60))
  const [intervalo, setIntervalo] = useState(String(tempos.intervaloSeg / 60))
  const [erro, setErro] = useState('')
  const [iniciando, setIniciando] = useState(false)

  const focoMin = lerMinutos(foco, LIMITE.foco)
  const intervaloMin = lerMinutos(intervalo, LIMITE.intervalo)

  async function enviar(evento) {
    evento.preventDefault()
    if (!focoMin || !intervaloMin) {
      setErro(`Use minutos inteiros: foco de 1 a ${LIMITE.foco} e intervalo de 1 a ${LIMITE.intervalo}.`)
      return
    }
    setIniciando(true)
    try {
      await comecar(tarefa.id, { focoSeg: focoMin * 60, intervaloSeg: intervaloMin * 60 })
      window.location.hash = '#/foco'
    } catch (erroApi) {
      setErro(erroApi.message)
      setIniciando(false)
    }
  }

  return (
    <Dialogo titulo="Iniciar foco" onFechar={onFechar} largura="pequena">
      <form className="formulario" onSubmit={enviar} noValidate>
        <p className="dialogo-texto">
          Sessão Pomodoro em <strong>{tarefa.titulo}</strong>. Ao fim do foco, o tempo é registrado e
          você pode fazer um intervalo.
        </p>

        <CampoMinutos
          rotulo="Foco"
          valor={foco}
          onChange={(v) => {
            setFoco(v)
            setErro('')
          }}
          atalhos={[15, 25, 50]}
          max={LIMITE.foco}
          erro={!focoMin}
        />
        <CampoMinutos
          rotulo="Intervalo"
          valor={intervalo}
          onChange={(v) => {
            setIntervalo(v)
            setErro('')
          }}
          atalhos={[5, 10, 15]}
          max={LIMITE.intervalo}
          erro={!intervaloMin}
        />

        {erro && (
          <p className="campo-erro" role="alert">
            {erro}
          </p>
        )}

        <footer className="acoes">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primario" disabled={iniciando} data-autofocus>
            {iniciando ? 'Iniciando…' : `Começar ${focoMin ?? '–'} min de foco`}
          </button>
        </footer>
      </form>
    </Dialogo>
  )
}

export default IniciarSessao
