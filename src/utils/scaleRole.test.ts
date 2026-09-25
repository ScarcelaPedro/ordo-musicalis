import { describe, expect, it } from 'vitest'
import { assignmentRole, assignmentRoleLabel, resolveAssignment } from '@/utils/scaleRole'

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
