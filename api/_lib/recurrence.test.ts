import { describe, expect, it } from 'vitest'
import { buildFixedAssignments, normalizeFixedLink, occurrenceDays } from './recurrence'

// October 2026 starts on a Thursday; Sundays are 4, 11, 18, 25.
describe('occurrenceDays', () => {
  it('returns every matching weekday for a weekly recurrence', () => {
    expect(occurrenceDays(2026, 9, { tipoRecorrencia: 'semanal', diaSemana: 0 })).toEqual([4, 11, 18, 25])
  })

  it('returns the nth weekday for a monthly recurrence', () => {
    expect(occurrenceDays(2026, 9, { tipoRecorrencia: 'mensal_ordinal', diaSemana: 0, ordinal: 2 })).toEqual([11])
  })

  it('returns nothing when the month has no 5th occurrence', () => {
    expect(occurrenceDays(2026, 9, { tipoRecorrencia: 'mensal_ordinal', diaSemana: 0, ordinal: 5 })).toEqual([])
    // Thursdays in October 2026: 1, 8, 15, 22, 29 -> there is a 5th.
    expect(occurrenceDays(2026, 9, { tipoRecorrencia: 'mensal_ordinal', diaSemana: 4, ordinal: 5 })).toEqual([29])
  })
})

describe('buildFixedAssignments', () => {
  it('carries category, ministry and liturgical role into the generated scale', () => {
    const rows = buildFixedAssignments(
      [
        { servidorId: 1, instrumentId: 3, categoriaId: 10, teamId: 7, funcaoLiturgica: null },
        { servidorId: 2, instrumentId: null, categoriaId: 20, teamId: null, funcaoLiturgica: 'turiferario' },
      ],
      null,
    )
    expect(rows).toEqual([
      { servidorId: 1, instrumentId: 3, teamId: 7, categoriaId: 10, funcaoLiturgica: null, origem: 'fixo' },
      { servidorId: 2, instrumentId: null, teamId: null, categoriaId: 20, funcaoLiturgica: 'turiferario', origem: 'fixo' },
    ])
  })

  it('falls back to the legacy template ministry only for links without one', () => {
    const rows = buildFixedAssignments(
      [
        { servidorId: 1, instrumentId: null, categoriaId: 10, teamId: null, funcaoLiturgica: null },
        { servidorId: 2, instrumentId: null, categoriaId: 10, teamId: 8, funcaoLiturgica: null },
      ],
      5,
    )
    expect(rows.map((r) => r.teamId)).toEqual([5, 8])
  })
})

describe('normalizeFixedLink', () => {
  const ctx = {
    servidorCategoriaIds: [1, 6],
    servidorInstrumentIds: [3],
    teamCategoriaId: null,
    musicaId: 1,
    acolitosId: 6,
  }

  it('requires a category the servidor actually has', () => {
    expect(normalizeFixedLink({}, ctx)).toEqual({ error: 'Informe a função do vínculo' })
    expect(normalizeFixedLink({ categoriaId: 4 }, ctx)).toEqual({ error: 'Este servidor não tem essa função no cadastro' })
  })

  it('accepts any non-music category without a ministry', () => {
    expect(normalizeFixedLink({ categoriaId: 6, funcaoLiturgica: 'naveteiro' }, ctx)).toEqual({
      data: { categoriaId: 6, teamId: null, instrumentId: null, funcaoLiturgica: 'naveteiro' },
    })
  })

  it('keeps the instrument only for Música, and only one the servidor plays', () => {
    expect(normalizeFixedLink({ categoriaId: 1, instrumentId: 3 }, ctx)).toMatchObject({ data: { instrumentId: 3 } })
    expect(normalizeFixedLink({ categoriaId: 6, instrumentId: 3 }, ctx)).toMatchObject({ data: { instrumentId: null } })
    expect(normalizeFixedLink({ categoriaId: 1, instrumentId: 9 }, ctx)).toEqual({ error: 'Este servidor não toca o instrumento escolhido' })
  })

  it('drops the liturgical role outside Acólitos and rejects unknown roles', () => {
    expect(normalizeFixedLink({ categoriaId: 1, funcaoLiturgica: 'naveteiro' }, ctx)).toMatchObject({ data: { funcaoLiturgica: null } })
    expect(normalizeFixedLink({ categoriaId: 6, funcaoLiturgica: 'bispo' }, ctx)).toEqual({ error: 'Função litúrgica inválida' })
  })

  it('rejects a ministry from another category', () => {
    expect(normalizeFixedLink({ categoriaId: 1, teamId: 2 }, { ...ctx, teamCategoriaId: 4 })).toEqual({
      error: 'O ministério escolhido não pertence a essa função',
    })
    expect(normalizeFixedLink({ categoriaId: 1, teamId: 2 }, { ...ctx, teamCategoriaId: 1 })).toMatchObject({ data: { teamId: 2 } })
  })
})
