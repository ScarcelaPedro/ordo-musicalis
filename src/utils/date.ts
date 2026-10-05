/**
 * Parses a date-only ISO string (e.g. "2026-08-15T00:00:00.000Z", as sent for
 * Prisma `@db.Date` fields) into a Date fixed at local noon, avoiding the
 * classic bug where converting a UTC-midnight instant to a negative-UTC-offset
 * timezone (e.g. Brazil, UTC-3) rolls the date back to the previous day.
 */
export function parseDateOnly(iso: string | null | undefined): Date | null {
  if (!iso) return null
  return new Date(iso.slice(0, 10) + 'T12:00:00')
}

/** Returns the month of `date` (local time) as "YYYY-MM", the value format of `<input type="month">`. */
export function toMonthValue(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
