import { describe, expect, it } from 'vitest'
import { celebrationNameFor, LITURGY_OF_THE_WORD } from './deaconCelebration'

describe('celebrationNameFor', () => {
  it('turns a deacon celebration into a Liturgy of the Word', () => {
    expect(celebrationNameFor('Santa Missa', 'Diác. Paulo')).toBe(LITURGY_OF_THE_WORD)
    expect(celebrationNameFor('Celebração dominical', 'Diácono Pedro')).toBe(LITURGY_OF_THE_WORD)
    expect(celebrationNameFor('', 'Diac Paulo')).toBe(LITURGY_OF_THE_WORD)
  })

  it('keeps a name that already is a Liturgy of the Word', () => {
    expect(celebrationNameFor('Celebração da Palavra - Crisma', 'Diác. Paulo')).toBe('Celebração da Palavra - Crisma')
  })

  it('does not touch priests, unknown titles or scales without celebrant', () => {
    expect(celebrationNameFor('Santa Missa', 'Pe. João')).toBe('Santa Missa')
    expect(celebrationNameFor('Santa Missa', 'Pedro Silva')).toBe('Santa Missa')
    expect(celebrationNameFor('Santa Missa', null)).toBe('Santa Missa')
  })
})
