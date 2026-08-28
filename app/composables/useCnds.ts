interface Cnd {
  file_name: string | null
  validade: string | null
  emissao: string | null
  status: string
  fornecedor: {
    name: string
    cnpj: string
  }
  cndtype: {
    name: string
  } | null
}

interface CndsResponse {
  data: Cnd[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CndsFiltros {
  name?: string
  cnpj?: string
  status?: string[]
  tipo?: string[]
  emissaoDe?: string
  emissaoAte?: string
  validadeDe?: string
  validadeAte?: string
  page?: number
  limit?: number
}

interface ApiError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

export function useCnds() {
  const cnds = ref<Cnd[]>([])
  const loading = ref(false)
  const error = ref('')
  const page = ref(1)
  const limit = ref(20)
  const total = ref(0)
  const totalPages = ref(0)

  const buscarCnds = async (filtros: CndsFiltros = {}): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const query: Record<string, string | number | string[]> = {}

      if (filtros.name) query.name = filtros.name
      if (filtros.cnpj) query.cnpj = filtros.cnpj
      if (filtros.status && filtros.status.length > 0) query.status = filtros.status
      if (filtros.tipo && filtros.tipo.length > 0) query.tipo = filtros.tipo
      if (filtros.emissaoDe) query.emissaoDe = filtros.emissaoDe
      if (filtros.emissaoAte) query.emissaoAte = filtros.emissaoAte
      if (filtros.validadeDe) query.validadeDe = filtros.validadeDe
      if (filtros.validadeAte) query.validadeAte = filtros.validadeAte

      query.page = filtros.page ?? 1
      query.limit = filtros.limit ?? limit.value

      const response = await $fetch<CndsResponse>('/api/cnds', { query })

      cnds.value = response.data
      page.value = response.page
      limit.value = response.limit
      total.value = response.total
      totalPages.value = response.totalPages
    } catch (err: unknown) {
      const errorData = err as {
        data?: ApiError
      }

      error.value =
        errorData.data?.message ||
        'Erro ao consultar CNDs'

      cnds.value = []
      total.value = 0
      totalPages.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    cnds,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    buscarCnds,
  }
}
