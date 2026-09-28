import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useDados } from '../../lib/dados'
import { EM_CURSO, FocoContext, restanteDe } from './foco'

const TEMPOS_PADRAO = { focoSeg: 25 * 60, intervaloSeg: 5 * 60 }

// Sessão Pomodoro em curso. Fica acima das telas para o timer seguir rodando ao navegar;
// o registro da sessão (início, fim, tempo focado) é feito pelo DadosProvider, como na API.
// Fases: foco → fim-foco → intervalo → fim-intervalo → foco (próxima sessão).
// "Pausar" congela o foco; "intervalo" é o descanso entre sessões.
export function FocoProvider({ children }) {
  const { iniciarSessao, finalizarSessao } = useDados()
  const [estado, setEstado] = useState(null)
  const [tempos, setTempos] = useState(TEMPOS_PADRAO)
  const [erro, setErro] = useState('')
  const finalizando = useRef(false)

  async function comecar(tarefaId, novosTempos = tempos) {
    const sessao = await iniciarSessao({ tarefa_id: tarefaId, tempo_total_segundos: novosTempos.focoSeg })
    setTempos(novosTempos)
    setErro('')
    setEstado({
      fase: 'foco',
      sessaoId: sessao.id,
      tarefaId,
      ...novosTempos,
      fimEm: Date.now() + novosTempos.focoSeg * 1000,
      parado: null,
      focadoSeg: 0,
    })
  }

  // Pausas não contam: o foco registrado é a duração escolhida menos o que faltava.
  async function terminarFoco(restante) {
    if (finalizando.current) return
    finalizando.current = true
    const focadoSeg = estado.focoSeg - restante
    try {
      await finalizarSessao(estado.sessaoId, { tempo_foco_segundos: focadoSeg })
      setErro('')
      setEstado((atual) => ({ ...atual, fase: 'fim-foco', parado: null, focadoSeg }))
    } catch (erroApi) {
      setErro(erroApi.message)
    } finally {
      finalizando.current = false
    }
  }

  // Fim do tempo: encerra o foco (registrando a sessão) ou o intervalo.
  const acabouOTempo = useEffectEvent(() => {
    if (estado.fase === 'foco') terminarFoco(0)
    else setEstado((atual) => ({ ...atual, fase: 'fim-intervalo' }))
  })

  useEffect(() => {
    if (!estado || !EM_CURSO.includes(estado.fase) || estado.parado !== null) return undefined
    const id = setTimeout(acabouOTempo, estado.fimEm - Date.now())
    return () => clearTimeout(id)
  }, [estado])

  // Fechar ou recarregar a aba no meio do foco perderia a sessão: o navegador pede confirmação.
  const focando = estado?.fase === 'foco'
  useEffect(() => {
    if (!focando) return undefined
    const avisar = (evento) => evento.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [focando])

  const valor = {
    estado,
    tempos,
    erro,
    comecar,
    pausar: () => setEstado((atual) => ({ ...atual, parado: restanteDe(atual, Date.now()) })),
    retomar: () => setEstado((atual) => ({ ...atual, fimEm: Date.now() + atual.parado * 1000, parado: null })),
    encerrar: () => estado?.fase === 'foco' && terminarFoco(restanteDe(estado, Date.now())),
    comecarIntervalo: () =>
      setEstado((atual) => ({ ...atual, fase: 'intervalo', fimEm: Date.now() + atual.intervaloSeg * 1000, parado: null })),
    // Sem o catch, uma recusa da API (ex.: 409) ao começar a próxima sessão sumiria sem aviso.
    proxima: () =>
      comecar(estado.tarefaId, { focoSeg: estado.focoSeg, intervaloSeg: estado.intervaloSeg }).catch((erroApi) =>
        setErro(erroApi.message),
      ),
    sair: () => setEstado(null),
  }

  return <FocoContext.Provider value={valor}>{children}</FocoContext.Provider>
}
