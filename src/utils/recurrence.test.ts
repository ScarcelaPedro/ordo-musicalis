import { describe, expect, it } from 'vitest'
import { recorrenciaLabel } from '@/utils/recurrence'

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
