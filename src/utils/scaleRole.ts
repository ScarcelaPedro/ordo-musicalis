// What a person does in a scale (SPEC-003.1 §13/§14 -- TASK-0104): the ministry/category
// ("Leitores", "Acólitos e Ancilas", "Música", ...) comes first, and the finer detail
// (liturgical function, instrument) complements it. Everything comes from the ScaleServidor
// pivot already returned by `GET /scales`; nothing is inferred.

export const FUNCAO_LITURGICA_LABELS: Record<string, string> = {
  cerimoniario_1: 'Cerimoniário 1',
  cerimoniario_2: 'Cerimoniário 2',
  librifero: 'Librífero',
  cruciferario: 'Cruciferário',
  ceroferario: 'Ceroferário',
  turiferario: 'Turiferário',
  naveteiro: 'Naveteiro',
}

export interface AssignmentLike {
  categoria?: { nome: string } | null
  team?: { nome?: string; categoria?: { nome: string } | null } | null
  funcaoLiturgica?: string | null
  instrument?: { nome: string } | null
  categoriaId?: number | null
  teamId?: number | null
}

export interface AssignmentRole {
  /** Ministry/category name, or null when the assignment has none. */
  ministry: string | null
  /** Liturgical function and/or instrument, e.g. "Turiferário" or "Violão". */
  details: string[]
}

export function assignmentRole(pivot: AssignmentLike | null | undefined): AssignmentRole {
  if (!pivot) return { ministry: null, details: [] }
  // Same fallback used by scales/Show.vue (gruposPorCategoria): pivot category, then its team's.
  const ministry = pivot.categoria?.nome ?? pivot.team?.categoria?.nome ?? null
  const details: string[] = []
  if (pivot.funcaoLiturgica) details.push(FUNCAO_LITURGICA_LABELS[pivot.funcaoLiturgica] ?? pivot.funcaoLiturgica)
  if (pivot.instrument) details.push(pivot.instrument.nome)
  return { ministry, details }
}

/** Single line for compact places, e.g. "Acólitos e Ancilas · Turiferário". */
export function assignmentRoleLabel(pivot: AssignmentLike | null | undefined): string | null {
  const { ministry, details } = assignmentRole(pivot)
  const parts = [ministry, ...details].filter((p): p is string => !!p)
  return parts.length ? parts.join(' · ') : null
}

export interface RoleLookups {
  categoriasById: Map<number, { nome: string }>
  teamsById: Map<number, { nome: string; categoria?: { nome: string } | null }>
}

/**
 * `GET /scales` (list) returns only `categoriaId`/`teamId` on each assignment -- the names live
 * in `GET /categorias` and `GET /teams`. Fills them in without changing the API (SPEC-003.1 §30).
 */
export function resolveAssignment<T extends AssignmentLike>(
  pivot: T | null | undefined,
  lookups: RoleLookups,
): T | null {
  if (!pivot) return null
  return {
    ...pivot,
    categoria: pivot.categoria ?? (pivot.categoriaId != null ? lookups.categoriasById.get(pivot.categoriaId) ?? null : null),
    team: pivot.team ?? (pivot.teamId != null ? lookups.teamsById.get(pivot.teamId) ?? null : null),
  }
}
