<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

const applyTheme = (value: Theme): void => {
  theme.value = value
  document.documentElement.setAttribute('data-theme', value)
}

const toggleTheme = (): void => {
  const newTheme: Theme = theme.value === 'light' ? 'dark' : 'light'

  applyTheme(newTheme)
  localStorage.setItem('theme', newTheme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')

  const initialTheme: Theme =
    savedTheme === 'dark' ? 'dark' : 'light'

  applyTheme(initialTheme)
})
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    @click="toggleTheme"
    :aria-label="
      'Mudar para tema ' +
      (theme === 'light' ? 'escuro' : 'claro')
    "
    :class="{
      'theme-toggle--dark': theme === 'dark'
    }"
  >
    <div class="theme-toggle__track">
      <span
        class="theme-toggle__icon theme-toggle__icon--light"
        :class="{ active: theme === 'light' }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41
               M17.66 17.66l1.41 1.41M2 12h2M20 12h2
               M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
      </span>

      <span
        class="theme-toggle__icon theme-toggle__icon--dark"
        :class="{ active: theme === 'dark' }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>

      <div class="theme-toggle__thumb">
        <span
          v-if="theme === 'light'"
          class="thumb-icon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41
                 M17.66 17.66l1.41 1.41M2 12h2M20 12h2
                 M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
        </span>

        <span
          v-else
          class="thumb-icon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  transition: transform 0.2s ease;
}

.theme-toggle__track {
  width: 76px;
  height: 38px;
  background: var(--bg-color);
  border: 3px solid var(--border-color);
  box-shadow: 4px 4px 0 var(--border-color);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  transition: all 0.2s ease;
}

.theme-toggle:hover .theme-toggle__track {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--border-color);
}

.theme-toggle:active .theme-toggle__track {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--border-color);
}

.theme-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--text-color);
  opacity: 0.35;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.theme-toggle__icon.active {
  opacity: 0.9;
  transform: scale(1.1);
}

.theme-toggle__thumb {
  width: 26px;
  height: 26px;
  background: var(--text-color);
  border: 2px solid var(--border-color);
  position: absolute;
  top: 3px;
  left: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-color);
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.3s ease;
}

.theme-toggle--dark .theme-toggle__thumb {
  transform: translateX(38px);
}

.thumb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .theme-toggle {
    top: 1rem;
    right: 1rem;
  }

  .theme-toggle__track {
    width: 68px;
    height: 34px;
    border-width: 2px;
    box-shadow: 3px 3px 0 var(--border-color);
  }

  .theme-toggle__thumb {
    width: 24px;
    height: 24px;
    top: 3px;
    left: 3px;
    border-width: 2px;
  }

  .theme-toggle--dark .theme-toggle__thumb {
    transform: translateX(33px);
  }

  .theme-toggle:hover .theme-toggle__track {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 var(--border-color);
  }

  .theme-toggle:active .theme-toggle__track {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 var(--border-color);
  }
}
</style>