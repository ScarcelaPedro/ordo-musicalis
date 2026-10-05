// Remembers which collapsible cards the viewer opened or closed (TASK-0122). Per-browser
// convenience only: storage may be missing or throw (private mode, blocked site data), so every
// access is guarded and falls back to the card's default state.

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

const PREFIX = 'collapsed:'

export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadCollapsed(storage: KeyValueStorage | null, key: string, fallback = false): boolean {
  try {
    const stored = storage?.getItem(PREFIX + key)
    return stored == null ? fallback : stored === '1'
  } catch {
    return fallback
  }
}

export function saveCollapsed(storage: KeyValueStorage | null, key: string, collapsed: boolean) {
  try {
    // Both states are stored explicitly, so a card the viewer opened stays open even when its
    // default is collapsed.
    storage?.setItem(PREFIX + key, collapsed ? '1' : '0')
  } catch {
    // Not remembering the state is fine; the card still toggles.
  }
}
