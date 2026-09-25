import { describe, expect, it } from 'vitest'
import { firstName, greetingFor, longDate } from '@/utils/greeting'

const at = (h: number, m: number) => new Date(2026, 8, 25, h, m)

describe('greetingFor', () => {
  it('switches exactly at noon and at 18:00', () => {
    expect(greetingFor(at(0, 0))).toBe('Bom dia')
    expect(greetingFor(at(11, 59))).toBe('Bom dia')
    expect(greetingFor(at(12, 0))).toBe('Boa tarde')
    expect(greetingFor(at(17, 59))).toBe('Boa tarde')
    expect(greetingFor(at(18, 0))).toBe('Boa noite')
    expect(greetingFor(at(23, 59))).toBe('Boa noite')
  })
})

describe('firstName', () => {
  it('takes the first word and tolerates missing names', () => {
    expect(firstName('Ana Souza')).toBe('Ana')
    expect(firstName('  Pe. Antônio ')).toBe('Pe.')
    expect(firstName(undefined)).toBe('')
  })
})

describe('longDate', () => {
  it('formats in pt-BR with a capitalized weekday', () => {
    expect(longDate(at(10, 0))).toBe('Sexta-feira, 25 de setembro de 2026')
  })
})
