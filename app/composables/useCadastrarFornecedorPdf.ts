import { ref } from 'vue'

export interface FornecedorPdfError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

export interface FornecedorPdfData {
  cnpj: string
  name: string
  uf: string
  municipio: string
}

export interface FornecedorPdfResult {
  file: string
  success: boolean
  error?: FornecedorPdfError
  data?: FornecedorPdfData
}

export function useCadastrarFornecedorPdf() {
  const loading = ref(false)
  const error = ref('')

  const enviar = async (files: File[]): Promise<FornecedorPdfResult[] | null> => {
    loading.value = true
    error.value = ''

    const formData = new FormData()
    for (const file of files) formData.append('file', file)

    try {
      return await $fetch<FornecedorPdfResult[]>('/api/fornecedores/pdf', {
        method: 'POST',
        body: formData,
      })
    } catch (err: unknown) {
      const errorData = err as { data?: FornecedorPdfError; statusMessage?: string }

      error.value = errorData.data?.message || errorData.statusMessage || 'Erro ao enviar os documentos'

      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    enviar,
  }
}
