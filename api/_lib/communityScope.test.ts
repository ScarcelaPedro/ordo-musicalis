import { describe, expect, it } from 'vitest'
import { canDecideSubstitution, canManageScaleServers, canUseSchedulingTools, partitionCoordinatorIds, substitutionScopeWhere } from './communityScope'

describe('partitionCoordinatorIds', () => {
  const eligible = [
    { id: 1, userId: 10 },
    { id: 2, userId: null },
    { id: 3, userId: 30 },
  ]

  it('accepts only existing servers that have a login', () => {
    expect(partitionCoordinatorIds([1, 2, 3, 99], eligible)).toEqual({ valid: [1, 3], invalid: [2, 99] })
  })

  it('deduplicates and ignores non-numeric values', () => {
    expect(partitionCoordinatorIds([1, '1', 'x', -4, 3], eligible)).toEqual({ valid: [1, 3], invalid: [] })
  })

  it('treats a missing or non-array body as an empty list', () => {
    expect(partitionCoordinatorIds(undefined, eligible)).toEqual({ valid: [], invalid: [] })
    expect(partitionCoordinatorIds('1,2', eligible)).toEqual({ valid: [], invalid: [] })
  })
})

describe('canManageScaleServers', () => {
  const scale = { comunidadeId: 1 }
  const user = (role: string, coordinatedCommunityIds: number[] = []) => ({ role, coordinatedCommunityIds })

  it('always allows admins', () => {
    expect(canManageScaleServers(user('admin'), scale, false)).toBe(true)
  })

  it('keeps the ministry rule for ministry coordinators', () => {
    expect(canManageScaleServers(user('coordenador'), scale, true)).toBe(true)
    expect(canManageScaleServers(user('coordenador'), scale, false)).toBe(false)
  })

  it('allows a community coordinator only in the communities they coordinate', () => {
    expect(canManageScaleServers(user('musico', [1]), scale, false)).toBe(true)
    expect(canManageScaleServers(user('musico', [2]), { comunidadeId: 1 }, false)).toBe(false)
  })

  it('combines both rules for a ministry coordinator who also coordinates a community', () => {
    expect(canManageScaleServers(user('coordenador', [1]), scale, false)).toBe(true)
  })

  it('denies a regular server even if they "own" a team', () => {
    expect(canManageScaleServers(user('musico'), scale, true)).toBe(false)
  })
})

describe('canUseSchedulingTools', () => {
  it('is for staff and community coordinators only', () => {
    expect(canUseSchedulingTools({ role: 'admin', coordinatedCommunityIds: [] })).toBe(true)
    expect(canUseSchedulingTools({ role: 'coordenador', coordinatedCommunityIds: [] })).toBe(true)
    expect(canUseSchedulingTools({ role: 'musico', coordinatedCommunityIds: [3] })).toBe(true)
    expect(canUseSchedulingTools({ role: 'musico', coordinatedCommunityIds: [] })).toBe(false)
  })
})

describe('substitutionScopeWhere', () => {
  it('lets admins see everything', () => {
    expect(substitutionScopeWhere({ role: 'admin', coordinatedCommunityIds: [] })).toEqual({})
  })

  it('keeps the ministry rule for ministry coordinators', () => {
    expect(substitutionScopeWhere({ role: 'coordenador', servidorId: 7, coordinatedCommunityIds: [] })).toEqual({
      OR: [{ scaleServidor: { scale: { team: { responsavelId: 7 } } } }],
    })
  })

  it('scopes community coordinators to their communities', () => {
    expect(substitutionScopeWhere({ role: 'musico', servidorId: 3, coordinatedCommunityIds: [1, 2] })).toEqual({
      OR: [{ scaleServidor: { scale: { comunidadeId: { in: [1, 2] } } } }],
    })
  })

  it('unions both rules when a ministry coordinator also coordinates a community', () => {
    const where = substitutionScopeWhere({ role: 'coordenador', servidorId: 7, coordinatedCommunityIds: [2] })
    expect(where).toEqual({
      OR: [
        { scaleServidor: { scale: { team: { responsavelId: 7 } } } },
        { scaleServidor: { scale: { comunidadeId: { in: [2] } } } },
      ],
    })
  })

  it('returns null for a regular server', () => {
    expect(substitutionScopeWhere({ role: 'musico', servidorId: 3, coordinatedCommunityIds: [] })).toBeNull()
  })

  it('never matches anything for a ministry coordinator without a server profile', () => {
    expect(substitutionScopeWhere({ role: 'coordenador', servidorId: null, coordinatedCommunityIds: [] })).toEqual({
      OR: [{ scaleServidor: { scale: { team: { responsavelId: -1 } } } }],
    })
  })
})

describe('canDecideSubstitution', () => {
  it('follows the same OR rule as the team edit', () => {
    expect(canDecideSubstitution({ role: 'musico', coordinatedCommunityIds: [1] }, { comunidadeId: 1 }, false)).toBe(true)
    expect(canDecideSubstitution({ role: 'musico', coordinatedCommunityIds: [1] }, { comunidadeId: 2 }, false)).toBe(false)
    expect(canDecideSubstitution({ role: 'coordenador', coordinatedCommunityIds: [] }, { comunidadeId: 2 }, true)).toBe(true)
  })
})
