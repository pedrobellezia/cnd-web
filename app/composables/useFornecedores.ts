interface Fornecedor {
  cnpj: string
  name: string
  uf: string
  municipio: string
}

interface ApiError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

export function useFornecedores() {
  const config = useRuntimeConfig()

  const fornecedores = ref<Fornecedor[]>([])
  const loading = ref(false)
  const error = ref('')

  const buscarFornecedores = async (): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      fornecedores.value = await $fetch<Fornecedor[]>(
        `${config.public.apiUrl}${config.public.apiBasePath}`,
      )
    } catch (err: unknown) {
      const errorData = err as {
        data?: ApiError
      }

      error.value =
        errorData.data?.message ||
        'Erro ao consultar fornecedores'

      fornecedores.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    fornecedores,
    loading,
    error,
    buscarFornecedores,
  }
}