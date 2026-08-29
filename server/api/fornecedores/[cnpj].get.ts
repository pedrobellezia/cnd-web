import { mockFornecedores, normalizeMockCnpj } from '../../mocks/fornecedores'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cnpj = getRouterParam(event, 'cnpj')
  const query = getQuery(event)

  if (config.mockApi) {
    const fornecedor = mockFornecedores.find(
      (f) => f.cnpj === normalizeMockCnpj(cnpj ?? ''),
    )

    if (!fornecedor) {
      throw createError({ statusCode: 404, statusMessage: 'Fornecedor não encontrado' })
    }

    return {
      name: fornecedor.name,
      cnpj: fornecedor.cnpj,
      cnd: fornecedor.cnd,
    }
  }

  return await $fetch(`${config.public.apiUrl}${config.apiBasePath}/${cnpj}`, {
    query,
    headers: {
      'x-api-key': config.apiKey,
    },
  })
})
