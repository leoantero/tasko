const TOKEN_KEY = 'tasko_token'

export function salvarToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function obterToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function limparToken() {
  localStorage.removeItem(TOKEN_KEY)
}
