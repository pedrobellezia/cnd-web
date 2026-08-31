<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { Cnd } from '@/composables/useCnds'
import { criarOpcoesNomeArquivoPadrao, extensaoDoArquivo, gerarNomeArquivo } from '@/composables/useCndFilename'

const props = defineProps<{
  cnd: Cnd
}>()

const emit = defineEmits<{
  close: []
  confirm: [fileName: string]
}>()

const opcoes = reactive(criarOpcoesNomeArquivoPadrao())

const nomeArquivo = ref('')
const editadoManualmente = ref(false)

const extensao = computed(() => extensaoDoArquivo(props.cnd.file_name))

const nomeGerado = computed(() => gerarNomeArquivo(props.cnd, opcoes))

watch(
  nomeGerado,
  (novoNome) => {
    if (!editadoManualmente.value) {
      nomeArquivo.value = novoNome
    }
  },
  { immediate: true },
)

const onInputManual = () => {
  editadoManualmente.value = true
}

const resetarNome = () => {
  editadoManualmente.value = false
  nomeArquivo.value = nomeGerado.value
}

const nomeFinalComExtensao = computed(() => `${nomeArquivo.value || 'documento'}${extensao.value}`)

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const confirmar = () => {
  emit('confirm', nomeFinalComExtensao.value)
}
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
        aria-labelledby="download-modal-title"
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
          id="download-modal-title"
          class="modal-title"
        >
          Nomear arquivo
        </h2>

        <div class="options-grid">
          <label class="option-row">
            <input
              v-model="opcoes.empresa"
              type="checkbox"
            >
            <span>Nome da empresa</span>
          </label>

          <div
            v-if="opcoes.empresa"
            class="sub-option"
          >
            <label class="radio-inline">
              <input
                v-model="opcoes.nomeEmpresaModo"
                type="radio"
                value="completo"
              >
              <span>Completo</span>
            </label>

            <label class="radio-inline">
              <input
                v-model="opcoes.nomeEmpresaModo"
                type="radio"
                value="abreviado"
              >
              <span>Abreviado</span>
            </label>

            <label class="radio-inline">
              <input
                v-model="opcoes.nomeEmpresaModo"
                type="radio"
                value="iniciais"
              >
              <span>Iniciais</span>
            </label>
          </div>

          <label class="option-row">
            <input
              v-model="opcoes.cnpj"
              type="checkbox"
            >
            <span>CNPJ</span>
          </label>

          <label class="option-row">
            <input
              v-model="opcoes.tipo"
              type="checkbox"
            >
            <span>Tipo da CND</span>
          </label>

          <label class="option-row">
            <input
              v-model="opcoes.emissao"
              type="checkbox"
            >
            <span>Data de emissão</span>
          </label>

          <label class="option-row">
            <input
              v-model="opcoes.validade"
              type="checkbox"
            >
            <span>Data de validade</span>
          </label>
        </div>

        <div class="preview-section">
          <label
            for="nome-arquivo-input"
            class="preview-label"
          >
            Nome do arquivo
          </label>

          <div class="preview-input-row">
            <input
              id="nome-arquivo-input"
              v-model="nomeArquivo"
              type="text"
              class="preview-input"
              @input="onInputManual"
            >
          </div>

          <button
            v-if="editadoManualmente"
            type="button"
            class="reset-link"
            @click="resetarNome"
          >
            RESTAURAR NOME AUTOMÁTICO
          </button>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn-secondary"
            @click="emit('close')"
          >
            CANCELAR
          </button>

          <button
            type="button"
            class="btn-primary"
            @click="confirmar"
          >
            BAIXAR
          </button>
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
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.modal-title {
  margin: 0 0 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.75rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.option-row input[type='checkbox'] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--btn-inverted-bg);
  cursor: pointer;
}

.sub-option {
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
  padding-left: 1.9rem;
  margin-top: -0.2rem;
}

.radio-inline {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  opacity: 0.85;
  cursor: pointer;
}

.radio-inline input[type='radio'] {
  accent-color: var(--btn-inverted-bg);
  cursor: pointer;
}

.preview-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-bottom: 1.75rem;
}

.preview-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  margin-bottom: 0.65rem;
}

.preview-input-row {
  display: flex;
  align-items: stretch;
  border: 2px solid var(--border-color);
  background: var(--card-bg);
}

.preview-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--text-color);
  padding: 0.75rem 0.85rem;
  font-size: 0.95rem;
  font-family: 'Courier New', monospace;
}

.preview-input:focus {
  outline: 2px solid var(--btn-inverted-bg);
  outline-offset: -2px;
}

.reset-link {
  margin-top: 0.5rem;
  background: none;
  border: none;
  padding: 0;
  color: var(--text-color);
  text-decoration: underline;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  opacity: 0.75;
}

.reset-link:hover {
  opacity: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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

.btn-secondary:hover {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.btn-primary {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.btn-primary:hover {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

@media (max-width: 480px) {
  .modal-box {
    padding: 2rem 1.25rem 1.25rem;
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
