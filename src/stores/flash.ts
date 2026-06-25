import { defineStore } from 'pinia'
import { ref } from 'vue'

type FlashType = 'success' | 'error' | 'info'

interface FlashMessage {
  type: FlashType
  message: string
}

export const useFlashStore = defineStore('flash', () => {
  const flash = ref<FlashMessage | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function set(type: FlashType, message: string, duration = 4000) {
    if (timer) clearTimeout(timer)
    flash.value = { type, message }
    timer = setTimeout(() => { flash.value = null }, duration)
  }

  function clear() {
    flash.value = null
  }

  return { flash, set, clear }
})
