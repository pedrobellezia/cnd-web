import { mockFornecedores, normalizeMockCnpj } from '../mocks/fornecedores'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  if (config.mockApi) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20

    const filtered = mockFornecedores.filter((f) => {
      if (query.cnpj && f.cnpj !== normalizeMockCnpj(String(query.cnpj))) return false
      if (query.uf && f.uf !== String(query.uf).toUpperCase()) return false
      if (query.municipio && f.municipio !== String(query.municipio).toUpperCase()) return false
      if (query.name && !f.name.toLowerCase().includes(String(query.name).toLowerCase())) return false
      return true
    })

    const total = filtered.length
    const data = filtered
      .slice((page - 1) * limit, page * limit)
      .map(({ cnpj, name, uf, municipio }) => ({ cnpj, name, uf, municipio }))

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }

  return await $fetch(`${config.public.apiUrl}/fornecedor`, {
    query,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
