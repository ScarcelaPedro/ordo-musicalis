// Pure recurrence logic (TASK-0117, ADR-0006), extracted from the scale-templates/vinculos-fixos
// routes so it can be tested without a database.

export type RecurrenceType = 'semanal' | 'mensal_ordinal'

export const FUNCOES_LITURGICAS = [
  'cerimoniario_1',
  'cerimoniario_2',
  'librifero',
  'cruciferario',
  'ceroferario',
  'turiferario',
  'naveteiro',
] as const
export type FuncaoLiturgica = (typeof FUNCOES_LITURGICAS)[number]

export function nthWeekdayOfMonth(year: number, monthIndex: number, dayOfWeek: number, n: number): number | null {
  const firstDow = new Date(year, monthIndex, 1).getDay()
  const day = 1 + ((dayOfWeek - firstDow + 7) % 7) + (n - 1) * 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  return day <= daysInMonth ? day : null
}

/** Days of the month (1-based) on which a recurrence produces a celebration. */
export function occurrenceDays(
  year: number,
  monthIndex: number,
  tpl: { tipoRecorrencia: RecurrenceType | string; diaSemana: number; ordinal?: number | null },
): number[] {
  if (tpl.tipoRecorrencia === 'semanal') {
    const days: number[] = []
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(year, monthIndex, d).getDay() === tpl.diaSemana) days.push(d)
    }
    return days
  }
  if (!tpl.ordinal) return []
  const day = nthWeekdayOfMonth(year, monthIndex, tpl.diaSemana, tpl.ordinal)
  return day ? [day] : []
}

export interface FixedLink {
  servidorId: number
  instrumentId: number | null
  categoriaId: number | null
  teamId: number | null
  funcaoLiturgica: FuncaoLiturgica | null
}

/**
 * Turns a recurrence's active fixed links into the `ScaleServidor` rows of a generated scale.
 * `legacyTeamId` is the recurrence's old template-level ministry, used only for links that
 * predate the per-link ministry.
 */
export function buildFixedAssignments(links: FixedLink[], legacyTeamId: number | null) {
  return links.map((v) => ({
    servidorId: v.servidorId,
    instrumentId: v.instrumentId,
    teamId: v.teamId ?? legacyTeamId,
    categoriaId: v.categoriaId,
    funcaoLiturgica: v.funcaoLiturgica,
    origem: 'fixo' as const,
  }))
}

export interface FixedLinkInput {
  categoriaId?: unknown
  teamId?: unknown
  instrumentId?: unknown
  funcaoLiturgica?: unknown
}

export interface FixedLinkContext {
  /** Categories the servidor has in their profile (ServidorCategoria). */
  servidorCategoriaIds: number[]
  /** Instruments the servidor plays (InstrumentServidor). */
  servidorInstrumentIds: number[]
  /** Category of the chosen ministry, when a ministry was given (null if it doesn't exist). */
  teamCategoriaId?: number | null
  musicaId: number | null
  acolitosId: number | null
}

const toId = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v))

/**
 * Validates and normalizes a fixed link, mirroring the rules of the manual scale form:
 * the category is required and must be one of the servidor's; the instrument only applies to
 * Música and the liturgical role only to Acólitos; the ministry is optional but must belong to
 * the same category.
 */
export function normalizeFixedLink(
  input: FixedLinkInput,
  ctx: FixedLinkContext,
): { error: string } | { data: Omit<FixedLink, 'servidorId'> } {
  const categoriaId = toId(input.categoriaId)
  if (!categoriaId) return { error: 'Informe a função do vínculo' }
  if (!ctx.servidorCategoriaIds.includes(categoriaId)) {
    return { error: 'Este servidor não tem essa função no cadastro' }
  }

  const teamId = toId(input.teamId)
  if (teamId && ctx.teamCategoriaId !== categoriaId) {
    return { error: 'O ministério escolhido não pertence a essa função' }
  }

  let instrumentId: number | null = null
  if (categoriaId === ctx.musicaId) {
    instrumentId = toId(input.instrumentId)
    if (instrumentId && !ctx.servidorInstrumentIds.includes(instrumentId)) {
      return { error: 'Este servidor não toca o instrumento escolhido' }
    }
  }

  let funcaoLiturgica: FuncaoLiturgica | null = null
  if (categoriaId === ctx.acolitosId && input.funcaoLiturgica) {
    if (!FUNCOES_LITURGICAS.includes(input.funcaoLiturgica as FuncaoLiturgica)) {
      return { error: 'Função litúrgica inválida' }
    }
    funcaoLiturgica = input.funcaoLiturgica as FuncaoLiturgica
  }

  return { data: { categoriaId, teamId, instrumentId, funcaoLiturgica } }
}
