import { describe, expect, it } from 'vitest'
import { parseDateOnly } from '@/utils/date'

describe('parseDateOnly', () => {
  it('keeps the calendar day of a UTC-midnight date-only value', () => {
    const date = parseDateOnly('2026-08-15T00:00:00.000Z')!
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(7)
    expect(date.getDate()).toBe(15)
  })

  it('accepts a plain YYYY-MM-DD string', () => {
    expect(parseDateOnly('2026-01-01')!.getDate()).toBe(1)
  })

  it('returns null for empty input', () => {
    expect(parseDateOnly(null)).toBeNull()
    expect(parseDateOnly(undefined)).toBeNull()
    expect(parseDateOnly('')).toBeNull()
  })
})
