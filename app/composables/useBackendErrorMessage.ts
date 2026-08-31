export interface BackendError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

// Tipos de negócio do backend, seguros para mostrar ao usuário (ex.: CND
// vencida, documento não é uma CND, fornecedor não encontrado). Qualquer
// outro tipo (falha interna, erro técnico do DeepSeek, etc.) usa uma
// mensagem genérica para não vazar detalhes de implementação.
const BUSINESS_ERROR_TYPES = new Set([
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'EXPIRED_CND',
  'RATE_LIMIT_EXCEEDED',
  'EMPTY_OR_UNREADABLE',
  'ANALYSIS_ERROR',
])

export function useBackendErrorMessage() {
  const getErrorMessage = (
    error: BackendError | undefined,
    fallback = 'Erro ao processar o documento',
  ): string => {
    if (error?.type && BUSINESS_ERROR_TYPES.has(error.type) && error.message) {
      return error.message
    }

    return fallback
  }

  return { getErrorMessage }
}
