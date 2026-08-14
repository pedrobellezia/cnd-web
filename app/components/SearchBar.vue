<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  search: [cnpj: string]
}>()

const cnpj = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string>('')

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14)

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement

  cnpj.value = formatCNPJ(target.value)

  if (error.value) {
    error.value = ''
  }
}

const buscarFornecedor = (): void => {
  const cnpjNumeros = cnpj.value.replace(/\D/g, '')

  if (!cnpjNumeros) {
    error.value = 'Por favor, digite um CNPJ'
    return
  }

  if (cnpjNumeros.length !== 14) {
    error.value = 'CNPJ deve ter 14 dígitos'
    return
  }

  error.value = ''

  emit('search', cnpjNumeros)
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && !loading.value) {
    buscarFornecedor()
  }
}

const setLoading = (value: boolean): void => {
  loading.value = value
}

const setError = (message: string): void => {
  error.value = message
}

defineExpose({
  setLoading,
  setError,
})
</script>

<template>
  <div class="search-section">
    <p class="subtitle">
      Digite o CNPJ para consultar os dados do fornecedor
    </p>

    <div class="search-wrapper">
      <input
        v-model="cnpj"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="00.000.000/0000-00"
        class="search-input"
        :disabled="loading"
        @input="handleInput"
        @keydown="handleKeyDown"
      />

      <button
        type="button"
        class="search-button"
        :disabled="loading"
        @click="buscarFornecedor"
      >
        {{ loading ? 'Buscando...' : 'Buscar' }}
      </button>
    </div>

    <div
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.search-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 1rem;
  text-align: center;
}

.subtitle {
  color: var(--text-color);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.search-wrapper {
  display: flex;
  gap: 0.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid var(--border-color);
  border-radius: 0;
  outline: none;
  background: var(--card-bg);
  color: var(--text-color);
  font-family: 'Courier New', monospace;
  font-weight: 500;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-color);
  opacity: 0.5;
}

.search-input:focus {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.search-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-button {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--btn-inverted-text);
  background: var(--btn-inverted-bg);
  border: 2px solid var(--border-color);
  border-radius: 0;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.3s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.search-button:active:not(:disabled) {
  transform: translate(0, 0);
  box-shadow: 2px 2px 0 var(--border-color);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-error);
  color: #fff;
  border: 2px solid var(--border-color);
  border-radius: 0;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  display: inline-block;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }
}
</style>