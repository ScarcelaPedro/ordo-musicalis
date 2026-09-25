import { describe, expect, it } from 'vitest'
import { computeCoverage, coveragePercent } from '@/utils/coverage'

const categorias = [
  { id: 1, nome: 'Música', ordem: 1 },
  { id: 4, nome: 'Leitores', ordem: 4 },
  { id: 3, nome: 'Acólitos e Ancilas', ordem: 3 },
  { id: 9, nome: 'Inativa', ordem: 0, ativo: false },
]
const teams = new Map([[20, 1]])

describe('computeCoverage', () => {
  it('counts celebrations with at least one active assignment per category, in category order', () => {
    const scales = [
      { id: 1, servidores: [{ status: 'confirmado', categoriaId: 4 }, { status: 'convidado', categoriaId: 4 }] },
      { id: 2, servidores: [{ status: 'convidado', categoriaId: 4 }, { status: 'confirmado', categoriaId: 3 }] },
      { id: 3, servidores: [] },
    ]
    expect(computeCoverage(scales, categorias, teams)).toEqual([
      { categoriaId: 1, nome: 'Música', covered: 0, total: 3 },
      { categoriaId: 3, nome: 'Acólitos e Ancilas', covered: 1, total: 3 },
      { categoriaId: 4, nome: 'Leitores', covered: 2, total: 3 },
    ])
  })

  it('falls back to the team category when the assignment has no category', () => {
    const rows = computeCoverage([{ id: 1, servidores: [{ status: 'confirmado', categoriaId: null, teamId: 20 }] }], categorias, teams)
    expect(rows.find((r) => r.nome === 'Música')?.covered).toBe(1)
  })

  it('ignores refused/replaced assignments and hides inactive categories', () => {
    const rows = computeCoverage([{ id: 1, servidores: [{ status: 'recusado', categoriaId: 4 }, { status: 'substituido', categoriaId: 4 }] }], categorias, teams)
    expect(rows.find((r) => r.nome === 'Leitores')?.covered).toBe(0)
    expect(rows.some((r) => r.nome === 'Inativa')).toBe(false)
  })

  it('handles a month without celebrations', () => {
    const rows = computeCoverage([], categorias, teams)
    expect(rows.every((r) => r.total === 0 && r.covered === 0)).toBe(true)
    expect(coveragePercent(rows[0])).toBe(0)
  })
})

describe('coveragePercent', () => {
  it('rounds to an integer percentage', () => {
    expect(coveragePercent({ covered: 2, total: 3 })).toBe(67)
    expect(coveragePercent({ covered: 3, total: 3 })).toBe(100)
  })
})
