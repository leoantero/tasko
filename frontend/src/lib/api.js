import { limparToken, obterToken } from './session'

// 5001 e nao 5000: no macOS a 5000 e do Receptor AirPlay.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api'

async function request(path, options = {}) {
  let response

  const token = obterToken()

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  const dados = await response.json().catch(() => ({}))

  // Token vencido ou invalido derruba a sessao em qualquer rota, nao so no
  // perfil. Erro de rede nao passa por aqui, entao nao desloga.
  if (response.status === 401 && token) {
    limparToken()
    window.dispatchEvent(new Event('sessao-expirada'))
  }

  if (!response.ok) {
    throw new Error(dados.erro || 'Erro inesperado. Tente novamente.')
  }

  return dados
}

export function login(email, senha) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

export function cadastrar(nome, email, senha) {
  return request('/usuarios', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  })
}

export function perfil() {
  return request('/perfil')
}

export function listarProjetos() {
  return request('/projetos')
}

export function criarProjeto(dados) {
  return request('/projetos', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarTarefas() {
  return request('/tarefas')
}

export function criarTarefa(dados) {
  return request('/tarefas', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarTarefa(id, mudancas) {
  return request(`/tarefas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mudancas),
  })
}

export function excluirTarefa(id) {
  return request(`/tarefas/${id}`, { method: 'DELETE' })
}
