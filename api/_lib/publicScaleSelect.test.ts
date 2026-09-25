import { describe, expect, it } from 'vitest'
import { publicScaleSelect } from './publicScaleSelect'

// Collects every "a.b.c" path selected, to assert on the public data contract.
function selectedPaths(select: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(select).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value === true) return [path]
    const nested = (value as { select?: Record<string, unknown> }).select
    return nested ? selectedPaths(nested, path) : []
  })
}

describe('publicScaleSelect', () => {
  const paths = selectedPaths(publicScaleSelect)

  it('exposes the ministry of each assignment (TASK-0109)', () => {
    expect(paths).toContain('servidores.categoria.nome')
    expect(paths).toContain('servidores.team.categoria.nome')
    expect(paths).toContain('servidores.funcaoLiturgica')
  })

  it('keeps what the public calendar already showed', () => {
    expect(paths).toEqual(expect.arrayContaining(['celebracao', 'horario', 'servidores.servidor.nome', 'servidores.instrument.nome', 'servidores.status']))
  })

  it('never exposes contact data or internal notes of servers', () => {
    const forbidden = paths.filter((p) => /(email|telefone|password|observacoes|userId)$/.test(p) && p.startsWith('servidores.'))
    expect(forbidden).toEqual([])
    // Only the name is selected from the server record itself.
    expect(paths.filter((p) => p.startsWith('servidores.servidor.'))).toEqual(['servidores.servidor.nome'])
  })
})
