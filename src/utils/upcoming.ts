// Selection of upcoming celebrations for the dashboards (TASK-0102).
//
// Uses the LOCAL calendar date/time: the previous implementation compared against
// `new Date().toISOString()` (UTC), so from 21:00 on in Brazil (UTC-3) "today" already was
// tomorrow and that evening's celebrations vanished from the list.

export interface UpcomingCandidate {
  id: number
  dataCelebracao: string // ISO date from the API, only the YYYY-MM-DD part matters
  horario: string // "HH:MM"
}

export function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function localTimeKey(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** Celebrations from `now` on (same day only if not started yet), sorted, deduplicated by id. */
export function selectUpcoming<T extends UpcomingCandidate>(scales: T[], now: Date, limit: number): T[] {
  const today = localDateKey(now)
  const time = localTimeKey(now)
  const unique = new Map<number, T>()
  for (const s of scales) unique.set(s.id, s)
  return [...unique.values()]
    .filter((s) => {
      const day = s.dataCelebracao.slice(0, 10)
      return day > today || (day === today && s.horario >= time)
    })
    .sort((a, b) => a.dataCelebracao.slice(0, 10).localeCompare(b.dataCelebracao.slice(0, 10)) || a.horario.localeCompare(b.horario))
    .slice(0, limit)
}

/** "YYYY-MM" keys of the month of `now` and the following one (for `GET /scales?mes=`). */
export function currentAndNextMonthKeys(now: Date): [string, string] {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  return [key(now), key(next)]
}
