// Liturgical colors (SPEC-003.1 §9, §10, §24, §25 -- TASK-0100).
//
// These colors describe the LITURGICAL SEASON/celebration of a day. They are a token category
// of their own and must never be used to express system status (confirmed, pending, ...) --
// status uses the semantic palette (success/warning/...) plus text/icon, see Badge.vue.
//
// The values are exactly the ones already stored in `Liturgia.cor` (default 'Verde' in
// api/_lib/fetchLiturgia.ts and api/_routes/liturgia.ts). Do not add new classifications here
// (SPEC-003.1 §10): `meaning` only explains the existing values.

export const LITURGICAL_COLORS = ['Verde', 'Roxo', 'Branco', 'Vermelho', 'Rosa'] as const

export type LiturgicalColor = (typeof LITURGICAL_COLORS)[number]

export interface LiturgicalColorStyle {
  /** Short explanation shown in legends/tooltips (pt-BR, user-facing). */
  meaning: string
  /** Small round indicator (legend swatch, calendar marker). */
  dot: string
  /** Soft full-cell background (current Dashboard calendar cells). */
  cell: string
  /** Pill badge with readable text, light and dark themes. */
  badge: string
}

export const LITURGICAL_COLOR_STYLES: Record<LiturgicalColor, LiturgicalColorStyle> = {
  Verde: {
    meaning: 'Tempo Comum',
    dot: 'bg-green-600 dark:bg-green-400',
    cell: 'bg-green-100 dark:bg-green-950/40',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  Roxo: {
    meaning: 'Advento e Quaresma',
    dot: 'bg-purple-600 dark:bg-purple-400',
    cell: 'bg-purple-100 dark:bg-purple-950/40',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  Branco: {
    meaning: 'Natal, Páscoa e festas',
    // White needs an outline to be visible on a white surface.
    dot: 'bg-white ring-1 ring-inset ring-gray-400 dark:bg-gray-100 dark:ring-gray-300',
    cell: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500',
  },
  Vermelho: {
    meaning: 'Paixão, Pentecostes e mártires',
    dot: 'bg-red-600 dark:bg-red-400',
    cell: 'bg-red-100 dark:bg-red-950/40',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  Rosa: {
    meaning: '3º Domingo do Advento e 4º da Quaresma',
    dot: 'bg-pink-500 dark:bg-pink-400',
    cell: 'bg-pink-100 dark:bg-pink-950/40',
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  },
}

/** Neutral style for missing/unknown values -- never guesses a liturgical color. */
export const UNKNOWN_LITURGICAL_STYLE: LiturgicalColorStyle = {
  meaning: 'Cor litúrgica não informada',
  dot: 'bg-gray-300 dark:bg-gray-600',
  cell: 'bg-white dark:bg-gray-800',
  badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
}

export function isLiturgicalColor(value: unknown): value is LiturgicalColor {
  return typeof value === 'string' && (LITURGICAL_COLORS as readonly string[]).includes(value)
}

export function liturgicalColorStyle(cor: string | null | undefined): LiturgicalColorStyle {
  return isLiturgicalColor(cor) ? LITURGICAL_COLOR_STYLES[cor] : UNKNOWN_LITURGICAL_STYLE
}

/** Accessible text for a color indicator, e.g. "Tempo litúrgico: Roxo — Advento e Quaresma". */
export function liturgicalColorLabel(cor: string | null | undefined): string | null {
  if (!isLiturgicalColor(cor)) return null
  return `Tempo litúrgico: ${cor} — ${LITURGICAL_COLOR_STYLES[cor].meaning}`
}
