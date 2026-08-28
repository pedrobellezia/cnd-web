interface Cnd {
  [key: string]: unknown
}

interface Fornecedor {
  name: string
  cnpj: string
  cnd: Cnd[]
  [key: string]: unknown
}

interface ApiError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

export function useFornecedor() {
  const fornecedorData = ref<Fornecedor | null>(null)
  const loading = ref(false)
  const error = ref('')

  const buscarFornecedor = async (cnpj: string): Promise<void> => {
    loading.value = true
    error.value = ''
    fornecedorData.value = null

    try {
      fornecedorData.value = await $fetch<Fornecedor>(
        `/api/fornecedores/${cnpj}`,
        {
          query: {
            limit: 1,
          },
        },
      )
    } catch (err: unknown) {
      const errorData = err as {
        data?: ApiError
      }

      error.value =
        errorData.data?.message ||
        'Fornecedor não encontrado'
    } finally {
      loading.value = false
    }
  }

  return {
    fornecedorData,
    loading,
    error,
    buscarFornecedor,
  }
}