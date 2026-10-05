export const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
// Domingo e Sábado são masculinos; os demais dias (segunda-feira etc.) são femininos.
export const DIA_MASCULINO = [true, false, false, false, false, false, true]
export const ORDINAIS_M = ['1º', '2º', '3º', '4º', '5º']
export const ORDINAIS_F = ['1ª', '2ª', '3ª', '4ª', '5ª']

export function recorrenciaLabel(t: { diaSemana: number; tipoRecorrencia: string; ordinal?: number | null }) {
  const masculino = DIA_MASCULINO[t.diaSemana]
  if (t.tipoRecorrencia === 'mensal_ordinal') {
    const ordinal = (masculino ? ORDINAIS_M : ORDINAIS_F)[(t.ordinal ?? 1) - 1]
    return `${ordinal} ${DIAS[t.diaSemana]} do mês`
  }
  return `${masculino ? 'Todo' : 'Toda'} ${DIAS[t.diaSemana]}`
}

export interface TeamMemberCandidate {
  id: number
  nome: string
  ativo?: boolean
  categorias: { categoriaId: number }[]
  teams?: { teamId: number }[]
}

/**
 * Splits the members of a ministry into who can become a fixed link of a recurrence for the
 * given function and who can't because the function is missing from their profile (the API
 * rejects those). Inactive people and people already linked to the recurrence are left out.
 */
export function teamMembersForFixedLinks<T extends TeamMemberCandidate>(
  servidores: T[],
  teamId: number,
  categoriaId: number,
  linkedIds: Set<number>,
): { eligible: T[]; missingFunction: T[] } {
  const members = servidores.filter(
    (s) => s.ativo !== false && !linkedIds.has(s.id) && s.teams?.some((t) => t.teamId === teamId),
  )
  const hasFunction = (s: T) => s.categorias.some((c) => c.categoriaId === categoriaId)
  return { eligible: members.filter(hasFunction), missingFunction: members.filter((s) => !hasFunction(s)) }
}
