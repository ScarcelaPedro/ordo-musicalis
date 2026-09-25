import { describe, expect, it } from 'vitest'
import {
  LITURGICAL_COLORS,
  LITURGICAL_COLOR_STYLES,
  UNKNOWN_LITURGICAL_STYLE,
  liturgicalColorLabel,
  liturgicalColorStyle,
} from '@/utils/liturgicalColors'

describe('liturgicalColors', () => {
  it('covers exactly the values stored in Liturgia.cor', () => {
    expect([...LITURGICAL_COLORS]).toEqual(['Verde', 'Roxo', 'Branco', 'Vermelho', 'Rosa'])
    expect(Object.keys(LITURGICAL_COLOR_STYLES).sort()).toEqual([...LITURGICAL_COLORS].sort())
  })

  it('returns the style of a known color', () => {
    expect(liturgicalColorStyle('Roxo')).toBe(LITURGICAL_COLOR_STYLES.Roxo)
    expect(liturgicalColorStyle('Roxo').meaning).toBe('Advento e Quaresma')
  })

  it('falls back to a neutral style instead of guessing a color', () => {
    expect(liturgicalColorStyle(undefined)).toBe(UNKNOWN_LITURGICAL_STYLE)
    expect(liturgicalColorStyle(null)).toBe(UNKNOWN_LITURGICAL_STYLE)
    expect(liturgicalColorStyle('Especial')).toBe(UNKNOWN_LITURGICAL_STYLE)
    expect(liturgicalColorStyle('verde')).toBe(UNKNOWN_LITURGICAL_STYLE)
  })

  it('never reuses semantic status tokens for liturgical colors', () => {
    for (const style of Object.values(LITURGICAL_COLOR_STYLES)) {
      const classes = `${style.dot} ${style.cell} ${style.badge}`
      expect(classes).not.toMatch(/\b(?:[a-z]+:)?(?:bg|text|border|ring)-(?:success|warning|danger|info|primary|accent)-/)
    }
  })

  it('builds an accessible label only for known colors', () => {
    expect(liturgicalColorLabel('Verde')).toBe('Tempo litúrgico: Verde — Tempo Comum')
    expect(liturgicalColorLabel('')).toBeNull()
    expect(liturgicalColorLabel(undefined)).toBeNull()
  })
})
