import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

const media = window.matchMedia('(prefers-color-scheme: dark)')

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(readStoredPreference())
  const systemPrefersDark = ref(media.matches)

  const isDark = computed(() =>
    preference.value === 'dark' || (preference.value === 'system' && systemPrefersDark.value)
  )

  function setPreference(pref: ThemePreference) {
    preference.value = pref
    if (pref === 'system') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, pref)
    }
  }

  watch(isDark, (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  }, { immediate: true })

  media.addEventListener('change', (e) => {
    systemPrefersDark.value = e.matches
  })

  return { preference, isDark, setPreference }
})
