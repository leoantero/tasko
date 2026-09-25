const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  const dados = await response.json().catch(() => ({}))

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
