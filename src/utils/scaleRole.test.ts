import { describe, expect, it } from 'vitest'
import { assignmentRole, assignmentRoleLabel, resolveAssignment, scheduledPeople } from '@/utils/scaleRole'

describe('assignmentRole', () => {
  it('shows the ministry of any kind of server, not only musicians', () => {
    expect(assignmentRoleLabel({ categoria: { nome: 'Leitores' } })).toBe('Leitores')
    expect(assignmentRoleLabel({ categoria: { nome: 'Ministros da Comunhão' }, instrument: null })).toBe('Ministros da Comunhão')
  })

  it('adds liturgical function and instrument as details', () => {
    expect(assignmentRoleLabel({ categoria: { nome: 'Acólitos e Ancilas' }, funcaoLiturgica: 'turiferario' })).toBe('Acólitos e Ancilas · Turiferário')
    expect(assignmentRole({ categoria: { nome: 'Música' }, instrument: { nome: 'Violão' } })).toEqual({ ministry: 'Música', details: ['Violão'] })
  })

  it('falls back to the team category when the pivot has none', () => {
    expect(assignmentRoleLabel({ categoria: null, team: { nome: 'Coral', categoria: { nome: 'Música' } } })).toBe('Música')
  })

  it('returns null when there is nothing real to show', () => {
    expect(assignmentRoleLabel(null)).toBeNull()
    expect(assignmentRoleLabel({})).toBeNull()
  })
})

describe('resolveAssignment', () => {
  const lookups = {
    categoriasById: new Map([[4, { nome: 'Leitores' }]]),
    teamsById: new Map([[9, { nome: 'Coral', categoria: { nome: 'Música' } }]]),
  }

  it('fills ministry names from ids returned by the list endpoint', () => {
    expect(assignmentRoleLabel(resolveAssignment({ categoriaId: 4, teamId: null }, lookups))).toBe('Leitores')
    expect(assignmentRoleLabel(resolveAssignment({ categoriaId: null, teamId: 9 }, lookups))).toBe('Música')
  })

  it('keeps data already present and tolerates unknown ids', () => {
    expect(assignmentRoleLabel(resolveAssignment({ categoria: { nome: 'Acólitos e Ancilas' }, categoriaId: 4 }, lookups))).toBe('Acólitos e Ancilas')
    expect(assignmentRoleLabel(resolveAssignment({ categoriaId: 99 }, lookups))).toBeNull()
    expect(resolveAssignment(null, lookups)).toBeNull()
  })
})

describe('scheduledPeople', () => {
  const lookups = { categoriasById: new Map([[4, { nome: 'Leitores' }]]), teamsById: new Map() }
  const person = (id: number, nome: string, status: string, categoriaId: number | null = null) => ({
    servidor: { id, nome },
    status,
    categoriaId,
  })

  it('lists invited and confirmed people, flagging who has confirmed', () => {
    const result = scheduledPeople([person(1, 'Ana', 'convidado', 4), person(2, 'Bia', 'confirmado', 4)], lookups)
    expect(result).toEqual([
      { id: 1, nome: 'Ana', role: 'Leitores', confirmed: false },
      { id: 2, nome: 'Bia', role: 'Leitores', confirmed: true },
    ])
  })

  it('leaves out declined and replaced assignments', () => {
    const result = scheduledPeople([person(1, 'Ana', 'recusado'), person(2, 'Bia', 'substituido'), person(3, 'Caio', 'convidado')], lookups)
    expect(result.map((p) => p.nome)).toEqual(['Caio'])
  })

  it('groups by ministry and puts people without one last', () => {
    const result = scheduledPeople([person(1, 'Zé', 'convidado'), person(2, 'Bia', 'convidado', 4), person(3, 'Ana', 'convidado', 4)], lookups)
    expect(result.map((p) => p.nome)).toEqual(['Ana', 'Bia', 'Zé'])
  })
})
