// Page context for the dashboard header (SPEC-003.1 §22 -- TASK-0099).

/** "Bom dia" until 11:59, "Boa tarde" until 17:59, "Boa noite" from 18:00 (local time). */
export function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}

/** e.g. "Sexta-feira, 25 de setembro de 2026". */
export function longDate(date: Date): string {
  const text = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}
