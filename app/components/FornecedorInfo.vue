<script setup lang="ts">
interface Props {
  name: string
  cnpj: string
}

defineProps<Props>()

const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14)

  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
</script>

<template>
  <div class="fornecedor-info">
    <h2>{{ name }}</h2>

    <p class="cnpj-display">
      CNPJ: {{ formatCNPJ(cnpj) }}
    </p>
  </div>
</template>

<style scoped>
.fornecedor-info {
  background: var(--card-bg);
  color: var(--text-color);
  padding: 2rem;
  border: 3px solid var(--border-color);
  border-radius: 0;
  margin-bottom: 2rem;
  text-align: center;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.fornecedor-info h2 {
  color: var(--text-color);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
}

.cnpj-display {
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 400;
  font-family: 'Courier New', monospace;
  transition: color 0.3s ease;
}
</style>