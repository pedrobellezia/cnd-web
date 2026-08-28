interface Fornecedor {
  cnpj: string
  name: string
  uf: string
  municipio: string
}

interface FornecedoresResponse {
  data: Fornecedor[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FornecedoresFiltros {
  cnpj?: string
  name?: string
  uf?: string
  municipio?: string
  page?: number
  limit?: number
}

interface ApiError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

export function useFornecedores() {
  const fornecedores = ref<Fornecedor[]>([])
  const loading = ref(false)
  const error = ref('')
  const page = ref(1)
  const limit = ref(20)
  const total = ref(0)
  const totalPages = ref(0)

  const buscarFornecedores = async (
    filtros: FornecedoresFiltros = {},
  ): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const query: Record<string, string | number> = {}

      if (filtros.cnpj) query.cnpj = filtros.cnpj
      if (filtros.name) query.name = filtros.name
      if (filtros.uf) query.uf = filtros.uf
      if (filtros.municipio) query.municipio = filtros.municipio

      query.page = filtros.page ?? 1
      query.limit = filtros.limit ?? limit.value

      const response = await $fetch<FornecedoresResponse>(
        '/api/fornecedores',
        { query },
      )

      fornecedores.value = response.data
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
        'Erro ao consultar fornecedores'

      fornecedores.value = []
      total.value = 0
      totalPages.value = 0
    } finally {
      loading.value = false
    }
  }

  return {
    fornecedores,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    buscarFornecedores,
  }
}
