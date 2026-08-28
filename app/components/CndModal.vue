<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import FornecedorInfo from '@/components/FornecedorInfo.vue'
import CndCard from '@/components/CndCard.vue'
import { useFornecedor } from '@/composables/useFornecedor'

const props = defineProps<{
  cnpj: string
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  fornecedorData,
  loading,
  error,
  buscarFornecedor,
} = useFornecedor()

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  buscarFornecedor(props.cnpj)
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
      >
        <button
          type="button"
          class="modal-close"
          aria-label="Fechar"
          @click="emit('close')"
        >
          ✕
        </button>

        <div
          v-if="loading"
          class="loading-message"
        >
          BUSCANDO CNDS...
        </div>

        <div
          v-else-if="error"
          class="feedback feedback--error"
        >
          {{ error }}
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
  z-index: 1000;
}

.modal-box {
  position: relative;
  width: 100%;
  max-width: 1300px;
  max-height: 85vh;
  overflow-y: auto;

  background: var(--bg-color);
  color: var(--text-color);
  border: 2px solid var(--border-color);

  padding: 2.5rem 2rem 2rem;

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

.loading-message {
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
  margin-top: 0.5rem;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(390px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .modal-box {
    padding: 2.5rem 1.25rem 1.5rem;
  }

  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
