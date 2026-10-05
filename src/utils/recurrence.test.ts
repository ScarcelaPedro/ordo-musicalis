import { describe, expect, it } from 'vitest'
import { recorrenciaLabel, teamMembersForFixedLinks, type TeamMemberCandidate } from '@/utils/recurrence'

describe('recorrenciaLabel', () => {
  it('uses masculine form for weekly Sunday/Saturday', () => {
    expect(recorrenciaLabel({ diaSemana: 0, tipoRecorrencia: 'semanal' })).toBe('Todo Domingo')
    expect(recorrenciaLabel({ diaSemana: 6, tipoRecorrencia: 'semanal' })).toBe('Todo Sábado')
  })

  it('uses feminine form for weekly weekdays', () => {
    expect(recorrenciaLabel({ diaSemana: 3, tipoRecorrencia: 'semanal' })).toBe('Toda Quarta')
  })

  it('builds the monthly ordinal label with the matching gender', () => {
    expect(recorrenciaLabel({ diaSemana: 0, tipoRecorrencia: 'mensal_ordinal', ordinal: 2 })).toBe('2º Domingo do mês')
    expect(recorrenciaLabel({ diaSemana: 5, tipoRecorrencia: 'mensal_ordinal', ordinal: 1 })).toBe('1ª Sexta do mês')
  })

  it('defaults to the first week when ordinal is missing', () => {
    expect(recorrenciaLabel({ diaSemana: 1, tipoRecorrencia: 'mensal_ordinal', ordinal: null })).toBe('1ª Segunda do mês')
  })
})

describe('teamMembersForFixedLinks', () => {
  const person = (id: number, extra: Partial<TeamMemberCandidate> = {}): TeamMemberCandidate => ({
    id, nome: `P${id}`, categorias: [{ categoriaId: 1 }], teams: [{ teamId: 10 }], ...extra,
  })

  it('returns active, not-yet-linked members of the ministry that have the function', () => {
    const servidores = [
      person(1),
      person(2, { ativo: false }),
      person(3),
      person(4, { teams: [{ teamId: 99 }] }),
      person(5, { categorias: [{ categoriaId: 2 }] }),
    ]
    const result = teamMembersForFixedLinks(servidores, 10, 1, new Set([3]))
    expect(result.eligible.map((s) => s.id)).toEqual([1])
    expect(result.missingFunction.map((s) => s.id)).toEqual([5])
  })

  it('handles people without ministries', () => {
    expect(teamMembersForFixedLinks([person(1, { teams: undefined })], 10, 1, new Set()).eligible).toEqual([])
  })
})
