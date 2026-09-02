export interface BackendError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}


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
