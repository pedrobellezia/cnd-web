<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useFornecedores } from '@/composables/useFornecedores'
import CndModal from '@/components/CndModal.vue'
import CadastrarFornecedorModal from '@/components/CadastrarFornecedorModal.vue'
import type { FornecedorPdfData } from '@/composables/useCadastrarFornecedorPdf'

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const {
  fornecedores,
  loading,
  error,
  page,
  totalPages,
  buscarFornecedores,
} = useFornecedores()

const filtros = reactive({
  name: '',
  cnpj: '',
  uf: '',
  municipio: '',
})

const cnpjSelecionado = ref<string | null>(null)

const abrirCnds = (cnpj: string): void => {
  cnpjSelecionado.value = cnpj
}

const fecharCnds = (): void => {
  cnpjSelecionado.value = null
}

const modalCadastroAberto = ref(false)

const abrirCadastro = (): void => {
  modalCadastroAberto.value = true
}

const fecharCadastro = (): void => {
  modalCadastroAberto.value = false
}

const onFornecedorCadastrado = (_fornecedores: FornecedorPdfData[]): void => {
  buscarFornecedores({
    name: filtros.name,
    cnpj: filtros.cnpj,
    uf: filtros.uf,
    municipio: filtros.municipio,
    page: 1,
  })
}

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const handleCnpjInput = (event: Event): void => {
  const target = event.target as HTMLInputElement

  filtros.cnpj = formatCNPJ(target.value.slice(0, 18))
}

const aplicarFiltros = (): void => {
  buscarFornecedores({
    name: filtros.name,
    cnpj: filtros.cnpj,
    uf: filtros.uf,
    municipio: filtros.municipio,
    page: 1,
  })
}

const limparFiltros = (): void => {
  filtros.name = ''
  filtros.cnpj = ''
  filtros.uf = ''
  filtros.municipio = ''

  buscarFornecedores({ page: 1 })
}

const irParaPagina = (novaPagina: number): void => {
  buscarFornecedores({
    name: filtros.name,
    cnpj: filtros.cnpj,
    uf: filtros.uf,
    municipio: filtros.municipio,
    page: novaPagina,
  })
}

onMounted(() => {
  buscarFornecedores()
})
</script>

<template>
  <div class="fornecedores-page">
    <div class="container">
      <header class="page-header">
        <NuxtLink
          to="/"
          class="back-link"
        >
          ← Voltar
        </NuxtLink>

        <h1>Fornecedores cadastrados</h1>

        <p class="subtitle">
          Lista de fornecedores registrados no sistema
        </p>
      </header>

      <div class="page-actions">
        <button
          type="button"
          class="new-fornecedor-button"
          @click="abrirCadastro"
        >
          + CADASTRAR FORNECEDOR
        </button>
      </div>

      <form
        class="filters"
        @submit.prevent="aplicarFiltros"
      >
        <div class="filters-grid">
          <div class="filter-field">
            <label for="filtro-name">Nome</label>

            <input
              id="filtro-name"
              v-model="filtros.name"
              type="text"
              placeholder="Nome do fornecedor"
              autocomplete="off"
            />
          </div>

          <div class="filter-field">
            <label for="filtro-cnpj">CNPJ</label>

            <input
              id="filtro-cnpj"
              v-model="filtros.cnpj"
              type="text"
              inputmode="numeric"
              placeholder="00.000.000/0000-00"
              autocomplete="off"
              @input="handleCnpjInput"
            />
          </div>

          <div class="filter-field">
            <label for="filtro-uf">UF</label>

            <select
              id="filtro-uf"
              v-model="filtros.uf"
            >
              <option value="">
                Todas
              </option>

              <option
                v-for="uf in ESTADOS"
                :key="uf"
                :value="uf"
              >
                {{ uf }}
              </option>
            </select>
          </div>

          <div class="filter-field">
            <label for="filtro-municipio">Município</label>

            <input
              id="filtro-municipio"
              v-model="filtros.municipio"
              type="text"
              placeholder="Município"
              autocomplete="off"
            />
          </div>
        </div>

        <div class="filters-actions">
          <button
            type="submit"
            class="filter-button"
            :disabled="loading"
          >
            FILTRAR
          </button>

          <button
            type="button"
            class="filter-button filter-button--secondary"
            :disabled="loading"
            @click="limparFiltros"
          >
            LIMPAR
          </button>
        </div>
      </form>

      <div
        v-if="loading"
        class="feedback"
      >
        CARREGANDO FORNECEDORES...
      </div>

      <div
        v-else-if="error"
        class="feedback feedback--error"
      >
        <span>{{ error }}</span>

        <button
          type="button"
          class="retry-button"
          @click="buscarFornecedores"
        >
          TENTAR NOVAMENTE
        </button>
      </div>

      <div
        v-else-if="fornecedores.length === 0"
        class="feedback"
      >
        NENHUM FORNECEDOR CADASTRADO
      </div>

      <div
        v-else
        class="fornecedores-list"
      >
        <div
          v-for="fornecedor in fornecedores"
          :key="fornecedor.cnpj"
          class="fornecedor-card"
        >
          <div class="fornecedor-card__header">
            <h2>
              {{ fornecedor.name }}
            </h2>
          </div>

          <div class="fornecedor-card__body">
            <div class="info-row">
              <span class="label">CNPJ</span>

              <span class="value">
                {{ formatCNPJ(fornecedor.cnpj) }}
              </span>
            </div>

            <div
              v-if="fornecedor.municipio"
              class="info-row"
            >
              <span class="label">Município</span>

              <span class="value">
                {{ fornecedor.municipio }}
              </span>
            </div>

            <div
              v-if="fornecedor.uf"
              class="info-row"
            >
              <span class="label">UF</span>

              <span class="value">
                {{ fornecedor.uf }}
              </span>
            </div>
          </div>

          <div class="fornecedor-card__footer">
            <button
              type="button"
              class="view-button"
              @click="abrirCnds(fornecedor.cnpj)"
            >
              VER CNDs →
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && !error && totalPages > 1"
        class="pagination"
      >
        <button
          type="button"
          class="pagination-button"
          :disabled="page <= 1"
          @click="irParaPagina(page - 1)"
        >
          ← ANTERIOR
        </button>

        <span class="pagination-info">
          PÁGINA {{ page }} DE {{ totalPages }}
        </span>

        <button
          type="button"
          class="pagination-button"
          :disabled="page >= totalPages"
          @click="irParaPagina(page + 1)"
        >
          PRÓXIMA →
        </button>
      </div>
    </div>

    <CndModal
      v-if="cnpjSelecionado"
      :cnpj="cnpjSelecionado"
      @close="fecharCnds"
    />

    <CadastrarFornecedorModal
      v-if="modalCadastroAberto"
      @close="fecharCadastro"
      @created="onFornecedorCadastrado"
    />
  </div>
</template>

<style scoped>
.fornecedores-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 2rem;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 2.5rem;
}

.back-link {
  position: absolute;
  left: 0;
  top: 0;

  color: var(--text-color);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  border-bottom: 2px solid transparent;

  transition:
    color 0.3s ease,
    border-color 0.15s ease;
}

.back-link:hover {
  border-bottom-color: var(--border-color);
}

.page-header h1 {
  color: var(--text-color);
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.75rem;
}

.subtitle {
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.new-fornecedor-button {
  padding: 0.75rem 1.5rem;

  border: 2px solid var(--border-color);

  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

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

.new-fornecedor-button:hover {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.filters {
  border: 2px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  padding: 1.5rem;
  margin-bottom: 2rem;

  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-field label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.filter-field input,
.filter-field select {
  padding: 0.65rem 0.85rem;
  font-size: 0.95rem;
  border: 2px solid var(--border-color);
  border-radius: 0;
  outline: none;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: 'Courier New', monospace;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.filter-field input::placeholder {
  color: var(--text-color);
  opacity: 0.5;
}

.filter-field input:focus,
.filter-field select:focus {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.filters-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.filter-button {
  padding: 0.75rem 1.5rem;

  border: 2px solid var(--border-color);

  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

  cursor: pointer;

  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.filter-button:hover:not(:disabled) {
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.filter-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-button--secondary {
  background: var(--btn-bg);
  color: var(--btn-text);
}

.filter-button--secondary:hover:not(:disabled) {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.pagination-button {
  padding: 0.75rem 1.25rem;

  border: 2px solid var(--border-color);

  background: var(--btn-bg);
  color: var(--btn-text);

  cursor: pointer;

  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.pagination-button:hover:not(:disabled) {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fornecedores-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.fornecedor-card {
  border: 2px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);

  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.fornecedor-card:hover {
  box-shadow: 8px 8px 0 var(--border-color);
  transform: translate(-4px, -4px);
}

.fornecedor-card__header {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
  padding: 1.25rem;

  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.fornecedor-card__header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fornecedor-card__body {
  padding: 1.25rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  padding: 0.75rem 0;

  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.value {
  font-family: 'Courier New', monospace;
  text-align: right;
}

.fornecedor-card__footer {
  padding: 1rem 1.25rem;
  border-top: 2px solid var(--border-color);
}

.view-button {
  display: block;

  padding: 0.75rem 1rem;

  background: var(--btn-bg);
  color: var(--btn-text);

  border: 2px solid var(--border-color);

  text-decoration: none;
  text-align: center;

  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.view-button:hover {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.feedback {
  padding: 1.25rem;

  border: 2px solid var(--border-color);

  background: var(--card-bg);
  color: var(--text-color);

  text-align: center;

  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feedback--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.retry-button {
  padding: 0.75rem 1.25rem;

  border: 2px solid var(--border-color);

  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

  cursor: pointer;

  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.retry-button:hover {
  background: var(--btn-bg);
  color: var(--btn-text);

  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

@media (max-width: 900px) {
  .fornecedores-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .fornecedores-page {
    padding: 1.5rem;
  }

  .page-header h1 {
    font-size: 2rem;
    padding-top: 2.5rem;
  }

  .back-link {
    position: static;
    display: inline-block;
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .fornecedores-page {
    padding: 1rem;
  }

  .fornecedores-list {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }

  .page-actions {
    justify-content: stretch;
  }

  .new-fornecedor-button {
    width: 100%;
  }
}
</style>