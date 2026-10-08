import { describe, expect, it } from 'vitest'
import { diffScaleServidores } from './scaleServidoresSync'

const stored = (id: number, servidorId: number) => ({ id, servidorId })

describe('diffScaleServidores', () => {
  it('splits the sent list into added, removed and kept servers', () => {
    const diff = diffScaleServidores([stored(10, 1), stored(11, 2)], [{ servidorId: 2, categoriaId: 4 }, { servidorId: 3 }])
    expect(diff.toAdd.map((s) => s.servidorId)).toEqual([3])
    expect(diff.toRemove.map((s) => s.id)).toEqual([10])
    expect(diff.toUpdate).toEqual([{ servidorId: 2, categoriaId: 4 }])
  })

  it('removes everyone when an empty list is sent', () => {
    const diff = diffScaleServidores([stored(10, 1), stored(11, 2)], [])
    expect(diff.toRemove.map((s) => s.servidorId)).toEqual([1, 2])
    expect(diff.toAdd).toEqual([])
    expect(diff.toUpdate).toEqual([])
  })

  it('adds everyone on an empty scale', () => {
    const diff = diffScaleServidores([], [{ servidorId: 5 }, { servidorId: 6 }])
    expect(diff.toAdd.map((s) => s.servidorId)).toEqual([5, 6])
    expect(diff.toRemove).toEqual([])
  })
})
