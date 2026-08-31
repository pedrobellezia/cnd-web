<script setup lang="ts">
interface CndError {
  type?: string
  message?: string
  details?: Record<string, unknown>
}

interface CndResult {
  file: string
  success: boolean
  error?: CndError
}

const files = ref<File[]>([])
const isDragging = ref(false)
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILE_SIZE_MB = 10

const onFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement

  if (target.files) {
    addFiles(target.files)
  }

  // Permite selecionar o mesmo arquivo novamente depois.
  target.value = ''
}

const onDrop = (event: DragEvent): void => {
  isDragging.value = false

  if (event.dataTransfer?.files) {
    addFiles(event.dataTransfer.files)
  }
}

const addFiles = (fileList: FileList): void => {
  const newFiles = Array.from(fileList)

  const invalidFiles: string[] = []
  const validFiles: File[] = []

  for (const file of newFiles) {
    if (file.type !== 'application/pdf') {
      invalidFiles.push(`${file.name}: arquivo não é PDF`)
      continue
    }

    if (file.size > MAX_FILE_SIZE) {
      invalidFiles.push(
        `${file.name}: arquivo excede o limite de ${MAX_FILE_SIZE_MB} MB`,
      )
      continue
    }

    validFiles.push(file)
  }

  const existing = new Set(
    files.value.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
  )

  for (const file of validFiles) {
    const key = `${file.name}:${file.size}:${file.lastModified}`

    if (!existing.has(key)) {
      files.value.push(file)
      existing.add(key)
    }
  }

  if (invalidFiles.length > 0) {
    status.value = 'error'
    errorMsg.value = invalidFiles.join('\n')
  } else if (status.value === 'error') {
    resetStatus()
  }
}

const removeFile = (index: number): void => {
  files.value.splice(index, 1)

  if (files.value.length === 0 && status.value !== 'loading') {
    resetStatus()
  }
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getErrorMessage = (error: CndError | undefined): string => {
  if (!error) {
    return 'Erro desconhecido'
  }

  return error.message || 'Erro ao processar o documento'
}

const enviar = async (): Promise<void> => {
  if (files.value.length === 0 || status.value === 'loading') {
    return
  }

  status.value = 'loading'
  errorMsg.value = ''

  const formData = new FormData()

  for (const file of files.value) {
    formData.append('file', file)
  }

  try {
    const results = await $fetch<CndResult[]>(
      '/api/cnd',
      {
        method: 'POST',
        body: formData,
      },
    )

    const successes = results.filter((result) => result.success)
    const failures = results.filter((result) => !result.success)

    if (failures.length === 0) {
      status.value = 'success'
      files.value = []
      return
    }

    const errorDetails = failures
      .map((failure) => {
        return `• ${failure.file}: ${getErrorMessage(failure.error)}`
      })
      .join('\n')

    if (successes.length > 0) {
      const successNames = new Set(
        successes.map((success) => success.file),
      )

      files.value = files.value.filter(
        (file) => !successNames.has(file.name),
      )

      status.value = 'error'
      errorMsg.value =
        `Alguns documentos foram processados com sucesso, ` +
        `mas outros falharam:\n${errorDetails}`

      return
    }

    status.value = 'error'
    errorMsg.value =
      `Todos os documentos falharam no processamento:\n${errorDetails}`
  } catch (err: unknown) {
    status.value = 'error'

    const fetchError = err as {
      data?: CndError
      statusCode?: number
      statusMessage?: string
    }

    errorMsg.value =
      fetchError.data?.message ||
      fetchError.statusMessage ||
      'Erro ao enviar os documentos'
  }
}

const resetStatus = (): void => {
  status.value = 'idle'
  errorMsg.value = ''
}

const openFileDialog = (): void => {
  if (status.value !== 'loading') {
    fileInput.value?.click()
  }
}
</script>

<template>
  <div class="registrar-page">
    <div class="page-header">
      <NuxtLink to="/" class="back-link">
        ← Voltar
      </NuxtLink>

      <h1>Registrar CND</h1>
    </div>

    <div class="container">
      <div
        class="drop-zone"
        :class="{ 'drop-zone--active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="openFileDialog"
      >
        <input
          ref="fileInput"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          class="file-input"
          @change="onFileChange"
        />

        <p class="drop-zone__text">
          CLIQUE OU ARRASTE OS ARQUIVOS AQUI
        </p>

        <p class="drop-zone__hint">
          Apenas arquivos PDF · Máximo de {{ MAX_FILE_SIZE_MB }} MB por arquivo
        </p>
      </div>

      <div
        v-if="files.length > 0"
        class="file-list"
      >
        <div
          v-for="(file, index) in files"
          :key="`${file.name}-${file.size}-${file.lastModified}`"
          class="file-item"
        >
          <div class="file-item__info">
            <span class="file-item__name">
              {{ file.name }}
            </span>

            <span class="file-item__size">
              {{ formatSize(file.size) }}
            </span>
          </div>

          <button
            type="button"
            class="file-item__remove"
            :disabled="status === 'loading'"
            @click="removeFile(index)"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        v-if="status === 'success'"
        class="feedback feedback--success"
      >
        <span>
          DOCUMENTOS ENVIADOS COM SUCESSO
        </span>

        <button
          type="button"
          class="feedback__close"
          @click="resetStatus"
        >
          ✕
        </button>
      </div>

      <div
        v-if="status === 'error'"
        class="feedback feedback--error"
      >
        <span class="feedback__message">
          {{ errorMsg }}
        </span>

        <button
          type="button"
          class="feedback__close"
          @click="resetStatus"
        >
          ✕
        </button>
      </div>

      <button
        type="button"
        class="btn-enviar"
        :disabled="files.length === 0 || status === 'loading'"
        @click="enviar"
      >
        <span
          v-if="status === 'loading'"
          class="spinner"
        />

        <span v-else>
          {{ files.length > 0 ? `ENVIAR (${files.length})` : 'ENVIAR' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.registrar-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 2rem;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.page-header {
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.back-link {
  display: inline-block;
  color: var(--text-color);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
  border-bottom: 2px solid transparent;
  transition:
    border-color 0.15s ease,
    color 0.3s ease;
}

.back-link:hover {
  border-bottom-color: var(--border-color);
}

.page-header h1 {
  color: var(--text-color);
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  transition: color 0.3s ease;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Drop Zone */

.drop-zone {
  border: 2px solid var(--border-color);
  border-radius: 0;
  padding: 3.5rem 2rem;
  text-align: center;
  cursor: pointer;
  background: var(--drop-zone-bg);
  color: var(--text-color);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.drop-zone:hover,
.drop-zone--active {
  box-shadow: 6px 6px 0 var(--border-color);
  transform: translate(-3px, -3px);
}

.file-input {
  display: none;
}

.drop-zone__text {
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: inherit;
  margin-bottom: 0.35rem;
}

.drop-zone__hint {
  font-size: 0.8rem;
  color: inherit;
  font-weight: 400;
  opacity: 0.75;
}

/* File List */

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 2px solid var(--border-color);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item__info {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  min-width: 0;
}

.file-item__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Courier New', monospace;
}

.file-item__size {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.file-item__remove {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  margin-left: 0.5rem;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  flex-shrink: 0;
}

.file-item__remove:hover:not(:disabled) {
  background: var(--text-color);
  color: var(--bg-color);
}

.file-item__remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Feedback */

.feedback {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.feedback--success {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.feedback--error {
  background: var(--card-bg);
  color: var(--text-color);
}

.feedback__message {
  white-space: pre-line;
  line-height: 1.5;
}

.feedback__close {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0 0.25rem;
  flex-shrink: 0;
  color: inherit;
}

/* Submit Button */

.btn-enviar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 2px solid var(--border-color);
  border-radius: 0;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease,
    border-color 0.3s ease;
}

.btn-enviar:hover:not(:disabled) {
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow: 6px 6px 0 var(--border-color);
  transform: translate(-3px, -3px);
}

.btn-enviar:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Spinner */

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .registrar-page {
    padding: 1.5rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .registrar-page {
    padding: 1rem;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .drop-zone {
    padding: 2.5rem 1rem;
  }

  .file-item__info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
  }
}
</style>