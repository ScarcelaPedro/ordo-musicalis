// Community coordination rules (ADR-0009). Pure functions, so the access rules can be unit-tested
// without a database; routes load the data and call these.

/**
 * Normalizes the server ids an admin wants as coordinators of a community and reports the ones
 * that cannot be linked. Only servers with a login (`userId`) can coordinate, since the role is
 * about acting in the system.
 */
export function partitionCoordinatorIds(
  requested: unknown,
  eligible: { id: number; userId: number | null }[],
): { valid: number[]; invalid: number[] } {
  const ids = Array.isArray(requested) ? requested : []
  const unique = [...new Set(ids.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0))]
  const withLogin = new Set(eligible.filter((s) => s.userId != null).map((s) => s.id))
  return {
    valid: unique.filter((id) => withLogin.has(id)),
    invalid: unique.filter((id) => !withLogin.has(id)),
  }
}

export interface ScopeUser {
  role: string
  coordinatedCommunityIds: number[]
}

/**
 * Who may change the servers scheduled in a scale (ADR-0009, rule "OR"):
 * - admin;
 * - a ministry coordinator (`coordenador`) who owns at least one ministry of the scale (the rule
 *   that already existed for the full edit);
 * - a coordinator of the scale's community -- always the community stored in the database, never
 *   one sent by the client.
 */
export function canManageScaleServers(user: ScopeUser, scale: { comunidadeId: number }, ownsAnyScaleTeam: boolean): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'coordenador' && ownsAnyScaleTeam) return true
  return user.coordinatedCommunityIds.includes(scale.comunidadeId)
}

/** Staff or coordinator of at least one community: may use read-only scheduling helpers. */
export function canUseSchedulingTools(user: ScopeUser): boolean {
  return user.role === 'admin' || user.role === 'coordenador' || user.coordinatedCommunityIds.length > 0
}

/**
 * Prisma `where` for the substitutions a user may see (TASK-0131, ADR-0009), rule "OR":
 * - admin: all (`{}`);
 * - ministry coordinator: those whose scale's (legacy) ministry they are responsible for -- the
 *   rule that already existed;
 * - community coordinator: those whose scale is in a community they coordinate.
 * Returns `null` when the user may see none (caller answers 403).
 */
export function substitutionScopeWhere(user: ScopeUser & { servidorId?: number | null }): Record<string, unknown> | null {
  if (user.role === 'admin') return {}
  const or: Record<string, unknown>[] = []
  if (user.role === 'coordenador') {
    or.push({ scaleServidor: { scale: { team: { responsavelId: user.servidorId ?? -1 } } } })
  }
  if (user.coordinatedCommunityIds.length) {
    or.push({ scaleServidor: { scale: { comunidadeId: { in: user.coordinatedCommunityIds } } } })
  }
  return or.length ? { OR: or } : null
}

/** Same "OR" rule as the team edit, applied to deciding one substitution of a given scale. */
export function canDecideSubstitution(user: ScopeUser, scale: { comunidadeId: number }, ownsScaleTeam: boolean): boolean {
  return canManageScaleServers(user, scale, ownsScaleTeam)
}
