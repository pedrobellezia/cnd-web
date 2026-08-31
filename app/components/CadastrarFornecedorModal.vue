<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useCadastrarFornecedorPdf } from '@/composables/useCadastrarFornecedorPdf'
import type { FornecedorPdfResult } from '@/composables/useCadastrarFornecedorPdf'
import { useBackendErrorMessage } from '@/composables/useBackendErrorMessage'

const emit = defineEmits<{
  close: []
  created: [fornecedores: NonNullable<FornecedorPdfResult['data']>[]]
}>()

const { loading, error, enviar } = useCadastrarFornecedorPdf()
const { getErrorMessage } = useBackendErrorMessage()

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILE_SIZE_MB = 10

const files = ref<File[]>([])
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const resultados = ref<FornecedorPdfResult[] | null>(null)
const validationError = ref('')

const onFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement

  if (target.files) addFiles(target.files)

  target.value = ''
}

const onDrop = (event: DragEvent): void => {
  isDragging.value = false

  if (event.dataTransfer?.files) addFiles(event.dataTransfer.files)
}

const addFiles = (fileList: FileList): void => {
  validationError.value = ''

  const newFiles = Array.from(fileList)
  const invalidFiles: string[] = []
  const validFiles: File[] = []

  for (const file of newFiles) {
    if (file.type !== 'application/pdf') {
      invalidFiles.push(`${file.name}: arquivo não é PDF`)
      continue
    }

    if (file.size > MAX_FILE_SIZE) {
      invalidFiles.push(`${file.name}: arquivo excede o limite de ${MAX_FILE_SIZE_MB} MB`)
      continue
    }

    validFiles.push(file)
  }

  const existentes = new Set(files.value.map((file) => `${file.name}:${file.size}:${file.lastModified}`))

  for (const file of validFiles) {
    const chave = `${file.name}:${file.size}:${file.lastModified}`

    if (!existentes.has(chave)) {
      files.value.push(file)
      existentes.add(chave)
    }
  }

  if (invalidFiles.length > 0) validationError.value = invalidFiles.join('\n')
}

const removeFile = (index: number): void => {
  files.value.splice(index, 1)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14)

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const openFileDialog = (): void => {
  if (!loading.value) fileInput.value?.click()
}

const enviarArquivos = async (): Promise<void> => {
  if (files.value.length === 0 || loading.value) return

  const resposta = await enviar(files.value)

  if (!resposta) return

  resultados.value = resposta

  const sucessos = resposta.filter((r) => r.success && r.data).map((r) => r.data as NonNullable<FornecedorPdfResult['data']>)

  if (sucessos.length > 0) emit('created', sucessos)

  const nomesComSucesso = new Set(resposta.filter((r) => r.success).map((r) => r.file))
  files.value = files.value.filter((file) => !nomesComSucesso.has(file.name))
}

const novoEnvio = (): void => {
  resultados.value = null
  validationError.value = ''
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="modal-overlay"
      @click.self="emit('close')"
    >
      <div
        class="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cadastrar-fornecedor-title"
      >
        <button
          type="button"
          class="modal-close"
          aria-label="Fechar"
          @click="emit('close')"
        >
          ✕
        </button>

        <h2
          id="cadastrar-fornecedor-title"
          class="modal-title"
        >
          Cadastrar fornecedor
        </h2>

        <p class="modal-subtitle">
          Envie o comprovante de inscrição CNPJ (PDF). Os dados do fornecedor são extraídos automaticamente.
        </p>

        <template v-if="!resultados">
          <div
            class="drop-zone"
            :class="{ 'drop-zone--active': isDragging, 'drop-zone--disabled': loading }"
            @dragover.prevent="!loading && (isDragging = true)"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="!loading && onDrop($event)"
            @click="openFileDialog"
          >
            <input
              ref="fileInput"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              class="file-input"
              :disabled="loading"
              @change="onFileChange"
            >

            <p class="drop-zone__text">
              CLIQUE OU ARRASTE O COMPROVANTE AQUI
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
                <span class="file-item__name">{{ file.name }}</span>
                <span class="file-item__size">{{ formatSize(file.size) }}</span>
              </div>

              <button
                type="button"
                class="file-item__remove"
                :disabled="loading"
                @click="removeFile(index)"
              >
                ✕
              </button>
            </div>
          </div>

          <p
            v-if="validationError"
            class="feedback-message feedback-message--error"
          >
            {{ validationError }}
          </p>

          <p
            v-if="error"
            class="feedback-message feedback-message--error"
          >
            {{ error }}
          </p>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-secondary"
              :disabled="loading"
              @click="emit('close')"
            >
              CANCELAR
            </button>

            <button
              type="button"
              class="btn-primary"
              :disabled="files.length === 0 || loading"
              @click="enviarArquivos"
            >
              <span
                v-if="loading"
                class="spinner"
                aria-hidden="true"
              />
              {{ loading ? 'PROCESSANDO...' : `ENVIAR${files.length > 0 ? ` (${files.length})` : ''}` }}
            </button>
          </div>
        </template>

        <div
          v-else
          class="results"
        >
          <div
            v-for="(resultado, index) in resultados"
            :key="`${resultado.file}-${index}`"
            class="result-item"
            :class="resultado.success ? 'result-item--success' : 'result-item--error'"
          >
            <span class="result-item__icon">{{ resultado.success ? '✓' : '✕' }}</span>

            <div class="result-item__body">
              <span class="result-item__file">{{ resultado.file }}</span>

              <span
                v-if="resultado.success && resultado.data"
                class="result-item__detail"
              >
                {{ resultado.data.name }} · {{ formatCNPJ(resultado.data.cnpj) }}
              </span>

              <span
                v-else
                class="result-item__detail"
              >
                {{ getErrorMessage(resultado.error) }}
              </span>
            </div>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="novoEnvio"
            >
              ENVIAR MAIS
            </button>

            <button
              type="button"
              class="btn-primary"
              @click="emit('close')"
            >
              FECHAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  z-index: 1100;
}

.modal-box {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;

  background: var(--bg-color);
  color: var(--text-color);
  border: 2px solid var(--border-color);

  padding: 2.75rem 2.25rem 2.25rem;

  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;

  width: 2.25rem;
  height: 2.25rem;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--btn-bg);
  color: var(--btn-text);
  border: 2px solid var(--border-color);

  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.modal-close:hover {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-subtitle {
  margin: 0 0 1.5rem;
  font-size: 0.85rem;
  opacity: 0.75;
  line-height: 1.5;
}

.drop-zone {
  border: 2px solid var(--border-color);
  padding: 2.5rem 1.5rem;
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

.drop-zone:hover:not(.drop-zone--disabled),
.drop-zone--active {
  box-shadow: 6px 6px 0 var(--border-color);
  transform: translate(-3px, -3px);
}

.drop-zone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.file-input {
  display: none;
}

.drop-zone__text {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: inherit;
  margin-bottom: 0.35rem;
}

.drop-zone__hint {
  font-size: 0.78rem;
  color: inherit;
  font-weight: 400;
  opacity: 0.75;
}

.file-list {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--border-color);
  margin-top: 1.1rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
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
  font-size: 0.85rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Courier New', monospace;
}

.file-item__size {
  font-size: 0.72rem;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 700;
  text-transform: uppercase;
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
  flex-shrink: 0;
}

.file-item__remove:hover:not(:disabled) {
  opacity: 0.6;
}

.file-item__remove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.feedback-message {
  margin: 1.1rem 0 0;
  padding: 0.85rem 1rem;
  border: 2px solid var(--border-color);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: pre-line;
}

.feedback-message--error {
  background: var(--color-error);
  color: #fff;
  border-color: var(--color-error);
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 2px solid var(--border-color);
}

.result-item__icon {
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: 900;
}

.result-item--success .result-item__icon {
  color: var(--color-success);
  border: 2px solid var(--color-success);
}

.result-item--error .result-item__icon {
  color: var(--color-error);
  border: 2px solid var(--color-error);
}

.result-item__body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.result-item__file {
  font-size: 0.82rem;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.result-item__detail {
  font-size: 0.8rem;
  opacity: 0.75;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--border-color);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.btn-secondary {
  background: var(--btn-bg);
  color: var(--btn-text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.btn-primary {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.btn-primary:hover:not(:disabled) {
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .modal-box {
    padding: 2.25rem 1.5rem 1.5rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
    text-align: center;
  }
}
</style>
