<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import type { Cnd } from '@/composables/useCnds'
import { criarOpcoesNomeArquivoPadrao, deduplicarNomes, extensaoDoArquivo, gerarNomeArquivo } from '@/composables/useCndFilename'

const props = defineProps<{
  cnds: Cnd[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [items: { cnd: Cnd; fileName: string }[]]
}>()

const opcoes = reactive(criarOpcoesNomeArquivoPadrao())

interface ItemNome {
  cnd: Cnd
  nome: string
  editado: boolean
}

const itens = reactive<ItemNome[]>(
  props.cnds.map((cnd) => ({ cnd, nome: gerarNomeArquivo(cnd, opcoes), editado: false })),
)

watch(opcoes, () => {
  for (const item of itens) {
    if (!item.editado) item.nome = gerarNomeArquivo(item.cnd, opcoes)
  }
})

const onInputManual = (item: ItemNome): void => {
  item.editado = true
}

const resetarNome = (item: ItemNome): void => {
  item.editado = false
  item.nome = gerarNomeArquivo(item.cnd, opcoes)
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

const confirmar = () => {
  const nomesFinais = deduplicarNomes(itens.map((item) => item.nome.trim() || 'documento'))

  const resultado = itens.map((item, index) => ({
    cnd: item.cnd,
    fileName: `${nomesFinais[index]}${extensaoDoArquivo(item.cnd.file_name)}`,
  }))

  emit('confirm', resultado)
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
        aria-labelledby="bulk-download-modal-title"
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
          id="bulk-download-modal-title"
          class="modal-title"
        >
          Baixar {{ cnds.length }} {{ cnds.length === 1 ? 'CND' : 'CNDs' }}
        </h2>

        <p class="modal-subtitle">
          Escolha o que entra no nome de cada arquivo.
        </p>

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
          <span class="preview-label">Nome de cada arquivo</span>

          <ul class="preview-list">
            <li
              v-for="item in itens"
              :key="`${item.cnd.fornecedor.cnpj}-${item.cnd.file_name}`"
              class="preview-item"
            >
              <input
                v-model="item.nome"
                type="text"
                class="preview-item-input"
                @input="onInputManual(item)"
              >

              <button
                v-if="item.editado"
                type="button"
                class="reset-item-button"
                title="Restaurar nome automático"
                aria-label="Restaurar nome automático"
                @click="resetarNome(item)"
              >
                ↺
              </button>
            </li>
          </ul>
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
            BAIXAR {{ cnds.length }}
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
  max-width: 580px;
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
  margin-bottom: 0.75rem;
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 230px;
  overflow-y: auto;
  border: 2px solid var(--border-color);
  background: var(--card-bg);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--text-color);
  padding: 0.4rem 0.35rem;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
}

.preview-item-input:focus {
  outline: 2px solid var(--btn-inverted-bg);
  outline-offset: -2px;
}

.reset-item-button {
  flex-shrink: 0;
  width: 1.9rem;
  height: 1.9rem;

  display: flex;
  align-items: center;
  justify-content: center;

  background: none;
  border: 2px solid var(--border-color);
  color: var(--text-color);

  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.75;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.reset-item-button:hover {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
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
  background: var(--btn-bg);
  color: var(--btn-text);
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
