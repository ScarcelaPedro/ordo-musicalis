import { describe, expect, it } from 'vitest'
import { currentAndNextMonthKeys, selectUpcoming } from '@/utils/upcoming'

const s = (id: number, dataCelebracao: string, horario: string) => ({ id, dataCelebracao, horario })

describe('selectUpcoming', () => {
  it('keeps later celebrations of today and drops the ones already started', () => {
    const now = new Date(2026, 8, 27, 12, 0)
    const result = selectUpcoming([s(1, '2026-09-27T00:00:00.000Z', '10:00'), s(2, '2026-09-27T00:00:00.000Z', '19:00')], now, 5)
    expect(result.map((x) => x.id)).toEqual([2])
  })

  it('uses the local date late in the evening (no UTC rollover)', () => {
    // 22:30 local: in UTC-3 the ISO string would already be the next day.
    const now = new Date(2026, 8, 27, 22, 30)
    const result = selectUpcoming([s(1, '2026-09-27T00:00:00.000Z', '23:00')], now, 5)
    expect(result.map((x) => x.id)).toEqual([1])
  })

  it('sorts by date then time, deduplicates and applies the limit', () => {
    const now = new Date(2026, 8, 1, 8, 0)
    const list = [
      s(3, '2026-10-04T00:00:00.000Z', '10:00'),
      s(1, '2026-09-20T00:00:00.000Z', '19:00'),
      s(2, '2026-09-20T00:00:00.000Z', '10:00'),
      s(1, '2026-09-20T00:00:00.000Z', '19:00'),
    ]
    expect(selectUpcoming(list, now, 2).map((x) => x.id)).toEqual([2, 1])
  })
})

describe('currentAndNextMonthKeys', () => {
  it('rolls over the year in December', () => {
    expect(currentAndNextMonthKeys(new Date(2026, 11, 15))).toEqual(['2026-12', '2027-01'])
    expect(currentAndNextMonthKeys(new Date(2026, 8, 25))).toEqual(['2026-09', '2026-10'])
  })
})
