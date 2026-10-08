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
