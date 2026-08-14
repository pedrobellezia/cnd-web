<script setup lang="ts">
import { ref, watch } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import FornecedorInfo from '@/components/FornecedorInfo.vue'
import CndCard from '@/components/CndCard.vue'
import { useFornecedor } from '@/composables/useFornecedor'

const route = useRoute()

const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

const {
  fornecedorData,
  loading,
  error,
  buscarFornecedor,
} = useFornecedor()

const handleSearch = async (cnpj: string): Promise<void> => {
  searchBarRef.value?.setLoading(true)
  searchBarRef.value?.setError('')

  await buscarFornecedor(cnpj)

  searchBarRef.value?.setLoading(false)

  if (error.value) {
    searchBarRef.value?.setError(error.value)
  }
}

watch(
  () => route.query.cnpj,
  (cnpj) => {
    if (typeof cnpj === 'string' && cnpj.trim() !== '') {
      handleSearch(cnpj)
    }
  },
  { immediate: true },
)
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
      </header>

      <SearchBar
        ref="searchBarRef"
        @search="handleSearch"
      />

      <div
        v-if="loading"
        class="loading-message"
      >
        BUSCANDO FORNECEDOR...
      </div>

      <div
        v-else-if="fornecedorData"
        class="results-section"
      >
        <FornecedorInfo
          :name="fornecedorData.name"
          :cnpj="fornecedorData.cnpj"
        />

        <div class="cards-container">
          <CndCard
            v-for="(cnd, index) in fornecedorData.cnd"
            :key="index"
            :cnd="cnd"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.consultar-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding: 2rem;
  transition: background-color 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  max-width: 600px;
  margin: 0 auto 1rem;
  text-align: center;
  position: relative;
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
    border-color 0.15s,
    color 0.3s ease;
  position: absolute;
  left: 0;
  top: 0;
}

.back-link:hover {
  border-bottom-color: var(--border-color);
}

.page-header h1 {
  color: var(--text-color);
  font-size: 2.5rem;
  margin: 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-top: 2.5rem;
  transition: color 0.3s ease;
}

.loading-message {
  margin: 2rem auto;
  max-width: 600px;
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

.results-section {
  margin-top: 2rem;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(340px, 1fr)
  );
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>