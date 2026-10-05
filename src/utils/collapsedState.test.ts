import { describe, expect, it } from 'vitest'
import { loadCollapsed, saveCollapsed } from './collapsedState'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v) },
  }
}

const throwingStorage = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') },
}

describe('collapsed state', () => {
  it('uses the default until the viewer toggles, then remembers the choice per key', () => {
    const storage = memoryStorage()
    expect(loadCollapsed(storage, 'a')).toBe(false)
    expect(loadCollapsed(storage, 'a', true)).toBe(true)
    saveCollapsed(storage, 'a', true)
    expect(loadCollapsed(storage, 'a')).toBe(true)
    expect(loadCollapsed(storage, 'b')).toBe(false)
  })

  it('keeps a card the viewer opened open even when it defaults to collapsed', () => {
    const storage = memoryStorage()
    saveCollapsed(storage, 'a', false)
    expect(loadCollapsed(storage, 'a', true)).toBe(false)
  })

  it('falls back to the default when storage is missing or throws', () => {
    expect(loadCollapsed(null, 'a')).toBe(false)
    expect(loadCollapsed(null, 'a', true)).toBe(true)
    expect(loadCollapsed(throwingStorage, 'a', true)).toBe(true)
    expect(() => saveCollapsed(throwingStorage, 'a', true)).not.toThrow()
    expect(() => saveCollapsed(null, 'a', true)).not.toThrow()
  })
})
