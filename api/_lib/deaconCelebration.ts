// Deacons cannot celebrate Masses (ADR-0008): whenever the celebrant is a deacon, the celebration
// is a Liturgy of the Word. Deacon detection reuses the title rule from ADR-0007.
import { celebranteTipo } from './massReport'

export const LITURGY_OF_THE_WORD = 'Celebração da Palavra'

export function celebrationNameFor(celebracao: string | null | undefined, celebranteNome: string | null | undefined): string | undefined {
  if (!celebranteNome || celebranteTipo(celebranteNome) !== 'diacono') return celebracao ?? undefined
  // Keep a name that already says it is a Liturgy of the Word (e.g. "Celebração da Palavra - Crisma").
  const normalized = (celebracao ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (normalized.includes('palavra') && !normalized.includes('missa')) return celebracao!
  return LITURGY_OF_THE_WORD
}
