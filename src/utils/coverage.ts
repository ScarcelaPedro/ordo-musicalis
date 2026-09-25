// Ministry coverage for the staff dashboard (SPEC-003.1 §15/§16 -- TASK-0103, ADR-0005).
//
// The system has no "expected slots per celebration" data, so a "12/16 escalados" fraction like
// the reference image cannot be computed. What IS real: for each ministry/category, in how many
// of the month's celebrations at least one person of that ministry is assigned. That is the
// metric here: covered celebrations / celebrations in the period.

export interface CoverageCategory {
  id: number
  nome: string
  ordem: number
  ativo?: boolean
}

export interface CoverageAssignment {
  status: string
  categoriaId?: number | null
  teamId?: number | null
  categoria?: { id?: number; nome?: string } | null
}

export interface CoverageScale {
  id: number
  servidores: CoverageAssignment[]
}

export interface CoverageRow {
  categoriaId: number
  nome: string
  covered: number
  total: number
}

// Refused or replaced assignments do not cover a celebration.
const ACTIVE_STATUSES = new Set(['convidado', 'confirmado'])

/**
 * @param teamCategoryById team id -> category id, used when an assignment only has `teamId`
 *   (same fallback as scales/Show.vue: pivot category, then its team's category).
 */
export function computeCoverage(
  scales: CoverageScale[],
  categorias: CoverageCategory[],
  teamCategoryById: Map<number, number>,
): CoverageRow[] {
  const coveredBy = new Map<number, Set<number>>()
  for (const scale of scales) {
    for (const a of scale.servidores) {
      if (!ACTIVE_STATUSES.has(a.status)) continue
      const categoriaId = a.categoria?.id ?? a.categoriaId ?? (a.teamId != null ? teamCategoryById.get(a.teamId) : undefined)
      if (categoriaId == null) continue
      if (!coveredBy.has(categoriaId)) coveredBy.set(categoriaId, new Set())
      coveredBy.get(categoriaId)!.add(scale.id)
    }
  }
  const total = new Set(scales.map((s) => s.id)).size
  return categorias
    .filter((c) => c.ativo !== false)
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
    .map((c) => ({ categoriaId: c.id, nome: c.nome, covered: coveredBy.get(c.id)?.size ?? 0, total }))
}

/** 0..100, rounded; 0 when there is nothing to cover. */
export function coveragePercent(row: Pick<CoverageRow, 'covered' | 'total'>): number {
  return row.total ? Math.round((row.covered / row.total) * 100) : 0
}
