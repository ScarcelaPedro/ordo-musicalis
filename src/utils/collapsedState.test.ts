import { describe, expect, it } from 'vitest'
import { loadCollapsed, saveCollapsed } from './collapsedState'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v) },
    removeItem: (k: string) => { data.delete(k) },
  }
}

const throwingStorage = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') },
  removeItem: () => { throw new Error('blocked') },
}

describe('collapsed state', () => {
  it('defaults to expanded and remembers a collapsed card per key', () => {
    const storage = memoryStorage()
    expect(loadCollapsed(storage, 'a')).toBe(false)
    saveCollapsed(storage, 'a', true)
    expect(loadCollapsed(storage, 'a')).toBe(true)
    expect(loadCollapsed(storage, 'b')).toBe(false)
    saveCollapsed(storage, 'a', false)
    expect(loadCollapsed(storage, 'a')).toBe(false)
  })

  it('falls back to expanded when storage is missing or throws', () => {
    expect(loadCollapsed(null, 'a')).toBe(false)
    expect(loadCollapsed(throwingStorage, 'a')).toBe(false)
    expect(() => saveCollapsed(throwingStorage, 'a', true)).not.toThrow()
    expect(() => saveCollapsed(null, 'a', true)).not.toThrow()
  })
})
