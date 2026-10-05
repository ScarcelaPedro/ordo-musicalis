// Remembers which collapsible cards the viewer closed (TASK-0122). Per-browser convenience only:
// storage may be missing or throw (private mode, blocked site data), so every access is guarded
// and falls back to "expanded".

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const PREFIX = 'collapsed:'

export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadCollapsed(storage: KeyValueStorage | null, key: string): boolean {
  try {
    return storage?.getItem(PREFIX + key) === '1'
  } catch {
    return false
  }
}

export function saveCollapsed(storage: KeyValueStorage | null, key: string, collapsed: boolean) {
  try {
    if (collapsed) storage?.setItem(PREFIX + key, '1')
    else storage?.removeItem(PREFIX + key)
  } catch {
    // Not remembering the state is fine; the card still toggles.
  }
}
