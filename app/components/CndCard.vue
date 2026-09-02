<script setup lang="ts">
interface Cnd {
  tipo: string
  status: string | null
  emissao?: string | null
  validade?: string | null
  file_name?: string | null
}

const props = defineProps<{
  cnd: Cnd
}>()

const config = useRuntimeConfig()

const isVencido = (dateString?: string | null): boolean => {
  if (!dateString) {
    return false
  }

  return new Date(dateString) < new Date()
}

const getStatusColor = (
  status: string | null,
  validade?: string | null,
): string => {
  if (!status || status === 'error') {
    return 'var(--color-neutral)'
  }

  if (validade && isVencido(validade)) {
    return 'var(--color-warning)'
  }

  if (status === 'regular') {
    return 'var(--color-success)'
  }

  return 'var(--color-error)'
}

const getBadgeLabel = (
  status: string | null
): string => {
  if (!status || status === 'em desenvolvimento' || status === 'error') {
    return 'INDISPONÍVEL'
  }  
  return status.toUpperCase()
}

const formatDate = (
  dateString?: string | null,
): string => {
  if (!dateString) {
    return '-'
  }

  return new Date(dateString).toLocaleDateString('pt-BR')
}

const getFileUrl = (
  fileName?: string | null,
): string => {
  if (!fileName) {
    return '#'
  }

  return `${config.public.apiUrl}/public/${fileName}`
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>
        CND {{ props.cnd.tipo.toUpperCase() }}
      </h3>

      <span
        class="status-badge"
        :style="{
          backgroundColor: getStatusColor(
            props.cnd.status,
            props.cnd.validade,
          ),
        }"
      >
        {{
          getBadgeLabel(
            props.cnd.status
          )
        }}
      </span>
    </div>

    <div class="card-body">
      <div class="info-row">
        <span class="label">
          Emissão:
        </span>

        <span class="value">
          {{ formatDate(props.cnd.emissao) }}
        </span>
      </div>

      <div class="info-row">
        <span class="label">
          Validade:
        </span>

        <span
          class="value"
          :class="{ vencida: props.cnd.status === 'regular' && isVencido(props.cnd.validade) }"
        >
          {{ formatDate(props.cnd.validade) }}
        </span>
      </div>
    </div>

    <div class="card-footer">
      <a
        v-if="props.cnd.file_name"
        :href="getFileUrl(props.cnd.file_name)"
        target="_blank"
        rel="noopener noreferrer"
        class="download-button"
      >
        Baixar PDF
      </a>

      <span
        v-else
        class="no-download"
      >
        DOCUMENTO INDISPONÍVEL
      </span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card-bg);
  color: var(--text-color);
  border: 2px solid var(--border-color);
  border-radius: 0;
  overflow: hidden;

  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.card:hover {
  box-shadow: 8px 8px 0 var(--border-color);
  transform: translate(-4px, -4px);
}

.card-header {
  background: var(--btn-inverted-bg);
  color: var(--btn-inverted-text);

  padding: 1.5rem;

  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 2px solid var(--border-color);

  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.card-header h3 {
  margin: 0;

  font-size: 1.2rem;
  font-weight: 700;

  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.status-badge {
  padding: 0.4rem 1rem;

  color: #fff;

  font-size: 0.75rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.1em;

  border: 2px solid var(--border-color);
}

.card-body {
  padding: 1.5rem;

  background: var(--card-bg);

  transition:
    background-color 0.3s ease;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 1rem 0;

  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-color);

  font-weight: 700;
  font-size: 0.85rem;

  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  color: var(--text-color);

  font-weight: 400;

  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-footer {
  padding: 1.5rem;

  background: var(--card-bg);

  text-align: center;

  border-top: 2px solid var(--border-color);

  transition:
    background-color 0.3s ease;
}

.download-button {
  display: inline-block;

  padding: 0.75rem 2rem;

  background: var(--btn-bg);
  color: var(--btn-text);

  text-decoration: none;

  border: 2px solid var(--border-color);

  font-weight: 700;
  font-size: 0.85rem;

  text-transform: uppercase;
  letter-spacing: 0.05em;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.download-button:hover {
  box-shadow: 4px 4px 0 var(--border-color);

  transform: translate(-2px, -2px);
}

.no-download {
  display: inline-block;

  padding: 0.75rem 2rem;

  background: var(--card-bg);
  color: var(--text-color);

  opacity: 0.5;

  font-weight: 700;
  font-size: 0.85rem;

  text-transform: uppercase;
  letter-spacing: 0.05em;

  border: 2px solid var(--border-color);

  cursor: not-allowed;
}
</style>