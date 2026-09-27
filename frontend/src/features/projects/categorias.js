// "faculdade" e "Faculdade" são a mesma categoria; acentos continuam diferenciando.
export function mesmaCategoria(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'accent' }) === 0
}

export function listarCategorias(projetos) {
  const categorias = []
  for (const { categoria } of projetos) {
    if (categoria && !categorias.some((c) => mesmaCategoria(c, categoria))) categorias.push(categoria)
  }
  return categorias.sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
