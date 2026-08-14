<script setup lang="ts">
import { onMounted } from 'vue'
import { useFornecedores } from '@/composables/useFornecedores'

const {
  fornecedores,
  loading,
  error,
  buscarFornecedores,
} = useFornecedores()

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
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
            <NuxtLink
              :to="`/consultar?cnpj=${fornecedor.cnpj}`"
              class="view-button"
            >
              VER CNDs →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
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
  max-width: 1000px;
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

.fornecedores-list {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(320px, 1fr)
  );
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
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.view-button:hover {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

  box-shadow: 4px 4px 0 var(--border-color);
  transform: translate(-2px, -2px);
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
    color 0.15s ease;
}

.retry-button:hover {
  background: var(--btn-bg);
  color: var(--btn-text);
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
}
</style>