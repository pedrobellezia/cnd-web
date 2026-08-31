<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useCnds } from '@/composables/useCnds'
import type { Cnd } from '@/composables/useCnds'
import DownloadFilenameModal from '@/components/DownloadFilenameModal.vue'
import BulkDownloadModal from '@/components/BulkDownloadModal.vue'

const TIPOS = ['federal', 'fgts', 'trabalhista', 'estadual', 'municipal']
const STATUSES = ['regular', 'irregular']

const config = useRuntimeConfig()

const {
  cnds,
  loading,
  error,
  page,
  totalPages,
  buscarCnds,
} = useCnds()

const filtros = reactive({
  name: '',
  cnpj: '',
  status: [] as string[],
  tipo: [] as string[],
  emissaoDe: '',
  emissaoAte: '',
  validadeDe: '',
  validadeAte: '',
})

// snapshot do que foi de fato submetido - só muda ao clicar em Filtrar/Limpar
// ou ao remover um chip; edições no formulário não devem refletir aqui antes disso
const filtrosAplicados = reactive({
  name: '',
  cnpj: '',
  status: [] as string[],
  tipo: [] as string[],
  emissaoDe: '',
  emissaoAte: '',
  validadeDe: '',
  validadeAte: '',
})

function snapshotFiltros(source: typeof filtros) {
  return {
    name: source.name,
    cnpj: source.cnpj,
    status: [...source.status],
    tipo: [...source.tipo],
    emissaoDe: source.emissaoDe,
    emissaoAte: source.emissaoAte,
    validadeDe: source.validadeDe,
    validadeAte: source.validadeAte,
  }
}

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14)

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return '-'
  }

  return new Date(dateString).toLocaleDateString('pt-BR')
}

const isVencido = (dateString: string | null): boolean => {
  if (!dateString) {
    return false
  }

  return new Date(dateString) < new Date()
}

const getFileUrl = (fileName: string | null): string => {
  if (!fileName) {
    return '#'
  }

  return `${config.public.apiUrl}/public/${fileName}`
}

const downloadFile = async (fileName: string, downloadName: string) => {
  const response = await fetch(getFileUrl(fileName))
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = downloadName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const cndParaDownload = ref<Cnd | null>(null)

const abrirModalDownload = (cnd: Cnd) => {
  cndParaDownload.value = cnd
}

const fecharModalDownload = () => {
  cndParaDownload.value = null
}

const confirmarDownload = async (fileName: string) => {
  const cnd = cndParaDownload.value
  if (!cnd?.file_name) return

  fecharModalDownload()
  await downloadFile(cnd.file_name, fileName)
}

const aplicarFiltros = (): void => {
  filtros.name = filtros.name.trim()
  filtros.cnpj = filtros.cnpj.trim()

  Object.assign(filtrosAplicados, snapshotFiltros(filtros))

  limparSelecao()
  buscarCnds({ ...snapshotFiltros(filtrosAplicados), page: 1 })
}

const limparFiltros = (): void => {
  filtros.name = ''
  filtros.cnpj = ''
  filtros.status = []
  filtros.tipo = []
  filtros.emissaoDe = ''
  filtros.emissaoAte = ''
  filtros.validadeDe = ''
  filtros.validadeAte = ''

  Object.assign(filtrosAplicados, snapshotFiltros(filtros))

  limparSelecao()
  buscarCnds({ page: 1 })
}

const irParaPagina = (novaPagina: number): void => {
  limparSelecao()
  buscarCnds({ ...snapshotFiltros(filtrosAplicados), page: novaPagina })
}

const cndsVisiveis = computed(() => cnds.value.filter((cnd) => cnd.status !== 'error'))

const selecionados = reactive(new Set<string>())

const cndsSelecionaveis = computed(() => cndsVisiveis.value.filter((cnd) => cnd.file_name))

const todosSelecionados = computed(
  () => cndsSelecionaveis.value.length > 0 && cndsSelecionaveis.value.every((cnd) => selecionados.has(cnd.file_name as string)),
)

const algunsSelecionados = computed(
  () => !todosSelecionados.value && cndsSelecionaveis.value.some((cnd) => selecionados.has(cnd.file_name as string)),
)

const selecaoCheckboxRef = ref<HTMLInputElement | null>(null)

watch(algunsSelecionados, (valor) => {
  if (selecaoCheckboxRef.value) selecaoCheckboxRef.value.indeterminate = valor
})

const alternarSelecaoTodos = (): void => {
  if (todosSelecionados.value) {
    for (const cnd of cndsSelecionaveis.value) selecionados.delete(cnd.file_name as string)
  } else {
    for (const cnd of cndsSelecionaveis.value) selecionados.add(cnd.file_name as string)
  }
}

const alternarSelecao = (fileName: string): void => {
  if (selecionados.has(fileName)) {
    selecionados.delete(fileName)
  } else {
    selecionados.add(fileName)
  }
}

const cndsSelecionadas = computed(() =>
  cndsVisiveis.value.filter((cnd) => cnd.file_name && selecionados.has(cnd.file_name)),
)

const limparSelecao = (): void => {
  selecionados.clear()
}

const modalDownloadEmMassaAberto = ref(false)
const baixandoZip = ref(false)

const confirmarDownloadEmMassa = async (itens: { cnd: Cnd; fileName: string }[]) => {
  modalDownloadEmMassaAberto.value = false
  limparSelecao()

  const items = itens
    .filter((item) => item.cnd.file_name)
    .map((item) => ({ sourceFileName: item.cnd.file_name as string, downloadName: item.fileName }))

  if (items.length === 0) return

  baixandoZip.value = true

  try {
    const blob = await $fetch<Blob>('/api/cnds/zip', {
      method: 'POST',
      body: { items },
      responseType: 'blob',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cnds.zip'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } finally {
    baixandoZip.value = false
  }
}

interface FiltroAtivo {
  key: string
  label: string
}

const filtrosAtivos = computed<FiltroAtivo[]>(() => {
  const chips: FiltroAtivo[] = []

  if (filtrosAplicados.name) chips.push({ key: 'name', label: `Fornecedor: ${filtrosAplicados.name}` })
  if (filtrosAplicados.cnpj) chips.push({ key: 'cnpj', label: `CNPJ: ${filtrosAplicados.cnpj}` })

  for (const tipo of filtrosAplicados.tipo) {
    chips.push({ key: `tipo:${tipo}`, label: `Tipo: ${tipo.toUpperCase()}` })
  }

  for (const status of filtrosAplicados.status) {
    chips.push({ key: `status:${status}`, label: `Status: ${status.toUpperCase()}` })
  }

  if (filtrosAplicados.emissaoDe) chips.push({ key: 'emissaoDe', label: `Emissão de: ${formatDate(filtrosAplicados.emissaoDe)}` })
  if (filtrosAplicados.emissaoAte) chips.push({ key: 'emissaoAte', label: `Emissão até: ${formatDate(filtrosAplicados.emissaoAte)}` })
  if (filtrosAplicados.validadeDe) chips.push({ key: 'validadeDe', label: `Validade de: ${formatDate(filtrosAplicados.validadeDe)}` })
  if (filtrosAplicados.validadeAte) chips.push({ key: 'validadeAte', label: `Validade até: ${formatDate(filtrosAplicados.validadeAte)}` })

  return chips
})

const removerFiltro = (key: string): void => {
  if (key.startsWith('tipo:')) {
    filtros.tipo = filtros.tipo.filter((tipo) => tipo !== key.slice('tipo:'.length))
  } else if (key.startsWith('status:')) {
    filtros.status = filtros.status.filter((status) => status !== key.slice('status:'.length))
  } else if (
    key === 'name' ||
    key === 'cnpj' ||
    key === 'emissaoDe' ||
    key === 'emissaoAte' ||
    key === 'validadeDe' ||
    key === 'validadeAte'
  ) {
    filtros[key] = ''
  }

  aplicarFiltros()
}

onMounted(() => {
  buscarCnds()
})
</script>

<template>
  <div class="consultar-page">
    <div class="container">
      <header class="page-header">
        <NuxtLink
          to="/"
          class="back-link"
        >
          ← Voltar
        </NuxtLink>

        <h1>Consulta de CNDs</h1>

        <p class="subtitle">
          Todas as certidões emitidas, com filtragem completa
        </p>
      </header>

      <form
        class="filters"
        @submit.prevent="aplicarFiltros"
      >
        <div class="filters-grid">
          <div class="filter-field">
            <label for="filtro-name">Fornecedor</label>

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
              placeholder="CNPJ ou vários separados por vírgula"
              autocomplete="off"
            />
          </div>
        </div>

        <div class="date-ranges">
          <fieldset class="filter-group">
            <legend>Emissão</legend>

            <div class="range-group__fields">
              <div class="filter-field">
                <label for="filtro-emissao-de">De</label>

                <input
                  id="filtro-emissao-de"
                  v-model="filtros.emissaoDe"
                  type="date"
                />
              </div>

              <div class="filter-field">
                <label for="filtro-emissao-ate">Até</label>

                <input
                  id="filtro-emissao-ate"
                  v-model="filtros.emissaoAte"
                  type="date"
                />
              </div>
            </div>
          </fieldset>

          <fieldset class="filter-group">
            <legend>Validade</legend>

            <div class="range-group__fields">
              <div class="filter-field">
                <label for="filtro-validade-de">De</label>

                <input
                  id="filtro-validade-de"
                  v-model="filtros.validadeDe"
                  type="date"
                />
              </div>

              <div class="filter-field">
                <label for="filtro-validade-ate">Até</label>

                <input
                  id="filtro-validade-ate"
                  v-model="filtros.validadeAte"
                  type="date"
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div class="filters-checkboxes">
          <fieldset class="filter-group">
            <legend>Tipo</legend>

            <div class="checkbox-group__items">
              <label
                v-for="tipo in TIPOS"
                :key="tipo"
                class="checkbox-item"
              >
                <input
                  v-model="filtros.tipo"
                  type="checkbox"
                  :value="tipo"
                />

                {{ tipo.toUpperCase() }}
              </label>
            </div>
          </fieldset>

          <fieldset class="filter-group">
            <legend>Status</legend>

            <div class="checkbox-group__items">
              <label
                v-for="status in STATUSES"
                :key="status"
                class="checkbox-item"
              >
                <input
                  v-model="filtros.status"
                  type="checkbox"
                  :value="status"
                />

                {{ status.toUpperCase() }}
              </label>
            </div>
          </fieldset>
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
        v-if="filtrosAtivos.length > 0"
        class="active-filters"
      >
        <span class="active-filters__label">Filtros ativos:</span>

        <button
          v-for="chip in filtrosAtivos"
          :key="chip.key"
          type="button"
          class="filter-chip"
          @click="removerFiltro(chip.key)"
        >
          {{ chip.label }}
          <span class="filter-chip__remove">×</span>
        </button>
      </div>

      <div
        v-if="loading"
        class="feedback"
      >
        CARREGANDO CNDs...
      </div>

      <div
        v-else-if="error"
        class="feedback feedback--error"
      >
        <span>{{ error }}</span>

        <button
          type="button"
          class="retry-button"
          @click="aplicarFiltros"
        >
          TENTAR NOVAMENTE
        </button>
      </div>

      <div
        v-else-if="cndsVisiveis.length === 0"
        class="feedback"
      >
        NENHUMA CND ENCONTRADA
      </div>

      <div
        v-else
        class="table-section"
      >
        <div class="bulk-actions">
          <span class="bulk-actions__info">
            {{ cndsSelecionadas.length > 0 ? `${cndsSelecionadas.length} SELECIONADA${cndsSelecionadas.length > 1 ? 'S' : ''}` : 'NENHUMA CND SELECIONADA' }}
          </span>

          <button
            type="button"
            class="download-selected-button"
            :disabled="cndsSelecionadas.length === 0 || baixandoZip"
            @click="modalDownloadEmMassaAberto = true"
          >
            {{ baixandoZip ? 'GERANDO ZIP...' : 'BAIXAR SELECIONADAS' }}
          </button>
        </div>

        <div class="table-wrapper">
          <table class="cnds-table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input
                  ref="selecaoCheckboxRef"
                  type="checkbox"
                  :checked="todosSelecionados"
                  aria-label="Selecionar todas as CNDs"
                  @change="alternarSelecaoTodos"
                >
              </th>
              <th>Fornecedor</th>
              <th>CNPJ</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Emissão</th>
              <th>Validade</th>
              <th>Arquivo</th>
              <th>Download</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(cnd, index) in cndsVisiveis"
              :key="index"
            >
              <td
                class="checkbox-cell"
                data-label="Selecionar"
              >
                <input
                  v-if="cnd.file_name"
                  type="checkbox"
                  :checked="selecionados.has(cnd.file_name)"
                  :aria-label="`Selecionar CND de ${cnd.fornecedor.name}`"
                  @change="alternarSelecao(cnd.file_name)"
                >
              </td>

              <td data-label="Fornecedor">{{ cnd.fornecedor.name }}</td>

              <td
                class="mono"
                data-label="CNPJ"
              >
                {{ formatCNPJ(cnd.fornecedor.cnpj) }}
              </td>

              <td data-label="Tipo">{{ cnd.cndtype?.name?.toUpperCase() || '-' }}</td>

              <td data-label="Status">
                <span
                  class="status-badge"
                  :class="{
                    'status-badge--regular': cnd.status === 'regular' && !isVencido(cnd.validade),
                    'status-badge--irregular': cnd.status === 'irregular',
                    'status-badge--expired': cnd.status === 'regular' && isVencido(cnd.validade),
                  }"
                >
                  {{ isVencido(cnd.validade) && cnd.status === 'regular' ? 'VENCIDA' : cnd.status.toUpperCase() }}
                </span>
              </td>

              <td data-label="Emissão">{{ formatDate(cnd.emissao) }}</td>

              <td data-label="Validade">{{ formatDate(cnd.validade) }}</td>

              <td data-label="Arquivo">
                <a
                  v-if="cnd.file_name"
                  :href="getFileUrl(cnd.file_name)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="file-link"
                >
                  VER PDF
                </a>

                <span v-else>-</span>
              </td>

              <td data-label="Download">
                <button
                  v-if="cnd.file_name"
                  type="button"
                  class="download-button"
                  @click="abrirModalDownload(cnd)"
                >
                  BAIXAR
                </button>

                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
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

    <DownloadFilenameModal
      v-if="cndParaDownload"
      :cnd="cndParaDownload"
      @close="fecharModalDownload"
      @confirm="confirmarDownload"
    />

    <BulkDownloadModal
      v-if="modalDownloadEmMassaAberto"
      :cnds="cndsSelecionadas"
      @close="modalDownloadEmMassaAberto = false"
      @confirm="confirmarDownloadEmMassa"
    />
  </div>
</template>

<style scoped>
.consultar-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 2rem;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.container {
  max-width: 1360px;
  margin: 0 auto;
}

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.date-ranges {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.filter-group {
  border: 2px solid var(--border-color);
  padding: 1rem 1rem 1.25rem;
  transition: border-color 0.3s ease;
}

.filter-group legend {
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color);
}

.range-group__fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.filter-field input {
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

.filter-field input:focus {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.filters-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.checkbox-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
}

.checkbox-item input {
  accent-color: var(--border-color);
  cursor: pointer;
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

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.active-filters__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  padding: 0.35rem 0.7rem;

  border: 2px solid var(--border-color);

  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

  cursor: pointer;

  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.filter-chip:hover {
  background: var(--btn-bg);
  color: var(--btn-text);
  box-shadow: 3px 3px 0 var(--border-color);
  transform: translate(-1px, -1px);
}

.filter-chip__remove {
  font-size: 0.9rem;
  line-height: 1;
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

.table-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bulk-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.bulk-actions__info {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  opacity: 0.75;
}

.download-selected-button {
  padding: 0.75rem 1.5rem;

  border: 2px solid var(--border-color);

  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

  cursor: pointer;
  white-space: nowrap;

  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.download-selected-button:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
}

.download-selected-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.checkbox-cell {
  width: 2.5rem;
  text-align: center;
}

.checkbox-cell input[type='checkbox'] {
  width: 1.05rem;
  height: 1.05rem;
  accent-color: var(--btn-inverted-bg);
  cursor: pointer;
}

.table-wrapper {
  border: 2px solid var(--border-color);
  overflow-x: auto;
}

.cnds-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 0.85rem;
  white-space: nowrap;
}

.cnds-table thead {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);
}

.cnds-table th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.cnds-table td {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border-color);
}

.cnds-table .mono {
  font-family: 'Courier New', monospace;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border: 2px solid var(--border-color);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  background: var(--color-neutral);
}

.status-badge--regular {
  background: var(--color-success);
}

.status-badge--irregular {
  background: var(--color-error);
}

.status-badge--expired {
  background: var(--color-warning);
}

.file-link {
  color: var(--text-color);
  font-weight: 700;
  text-decoration: underline;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.download-button {
  padding: 0.4rem 0.75rem;

  border: 2px solid var(--border-color);

  background: var(--btn-bg);
  color: var(--btn-text);

  cursor: pointer;

  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.download-button:hover {
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

@media (max-width: 700px) {
  .table-wrapper {
    border: none;
    overflow-x: visible;
  }

  .cnds-table,
  .cnds-table tbody,
  .cnds-table tr,
  .cnds-table td {
    display: block;
    width: 100%;
  }

  .cnds-table thead {
    display: none;
  }

  .cnds-table tr {
    border: 2px solid var(--border-color);
    margin-bottom: 1rem;
  }

  .cnds-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 1rem;
    border-top: none;
    border-bottom: 1px solid var(--border-color);
    white-space: normal;
    text-align: right;
  }

  .cnds-table tr td:last-child {
    border-bottom: none;
  }

  .cnds-table td::before {
    content: attr(data-label);
    text-align: left;
    opacity: 0.7;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

@media (max-width: 768px) {
  .consultar-page {
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
  .consultar-page {
    padding: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .date-ranges {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
