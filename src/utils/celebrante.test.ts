import { describe, expect, it } from 'vitest'
import { celebrationNameFor, isDeacon, LITURGY_OF_THE_WORD } from '@/utils/celebrante'

describe('isDeacon', () => {
  it('recognizes deacon titles only', () => {
    expect(isDeacon('Diác. Paulo')).toBe(true)
    expect(isDeacon('diacono Pedro')).toBe(true)
    expect(isDeacon('Pe. João')).toBe(false)
    expect(isDeacon('Diacuí Souza')).toBe(false)
    expect(isDeacon(null)).toBe(false)
  })
})

describe('celebrationNameFor', () => {
  it('forces Liturgy of the Word for deacons and leaves others alone', () => {
    expect(celebrationNameFor('Santa Missa', 'Diác. Paulo')).toBe(LITURGY_OF_THE_WORD)
    expect(celebrationNameFor('Celebração da Palavra - Crisma', 'Diác. Paulo')).toBe('Celebração da Palavra - Crisma')
    expect(celebrationNameFor('Santa Missa', 'Pe. João')).toBe('Santa Missa')
  })
})
