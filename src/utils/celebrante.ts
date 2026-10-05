// Frontend mirror of api/_lib/deaconCelebration.ts (ADR-0008): deacons only celebrate Liturgies
// of the Word. The API enforces the rule; this copy only lets the form show it right away.
export const LITURGY_OF_THE_WORD = 'Celebração da Palavra'

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export function isDeacon(nome: string | null | undefined): boolean {
  const title = normalize(nome ?? '').split(/[\s.]+/)[0] ?? ''
  return title === 'diac' || title === 'diacono'
}

export function celebrationNameFor(celebracao: string, celebranteNome: string | null | undefined): string {
  if (!isDeacon(celebranteNome)) return celebracao
  const name = normalize(celebracao)
  if (name.includes('palavra') && !name.includes('missa')) return celebracao
  return LITURGY_OF_THE_WORD
}
