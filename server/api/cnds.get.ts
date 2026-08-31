import { mockFornecedores, normalizeMockCnpj } from '../mocks/fornecedores'

function toArray(value: unknown): string[] | undefined {
  if (value == null) return undefined
  const parts = Array.isArray(value) ? value : [value]
  return parts.flatMap((v) => String(v).split(',')).map((v) => v.trim().toLowerCase())
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  if (config.mockApi) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const cnpjFiltro = toArray(query.cnpj)
    const statusFiltro = toArray(query.status) ?? ['irregular', 'regular']
    const tipoFiltro = toArray(query.tipo)

    const rows = mockFornecedores.flatMap((f) =>
      f.cnd.map((c) => ({
        file_name: c.file_name,
        validade: c.validade,
        emissao: c.emissao,
        status: c.status,
        fornecedor: { name: f.name, cnpj: f.cnpj },
        cndtype: { name: c.tipo },
      })),
    )

    const filtered = rows.filter((row) => {
      if (cnpjFiltro && !cnpjFiltro.map(normalizeMockCnpj).includes(row.fornecedor.cnpj)) return false
      if (statusFiltro && !statusFiltro.includes(String(row.status).toLowerCase())) return false
      if (tipoFiltro && !tipoFiltro.includes(row.cndtype.name.toLowerCase())) return false
      if (query.name && !row.fornecedor.name.toLowerCase().includes(String(query.name).toLowerCase())) return false
      return true
    })

    const total = filtered.length
    const data = filtered.slice((page - 1) * limit, page * limit)

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }

  return await $fetch(`${config.public.apiUrl}/cnd`, {
    query,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
