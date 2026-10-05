// Mass / Liturgy of the Word report (TASK-0123, ADR-0007).
// The celebration kind is derived from the celebrant's title: priests (Pe.) only celebrate
// Masses and deacons (Diác.) only celebrate Liturgies of the Word. When there is no celebrant
// (or the title is unknown) the free-text celebration name is used as a fallback.

export type CelebranteTipo = 'padre' | 'diacono' | 'outro'
export type CelebrationKind = 'missa' | 'palavra' | 'outra'

export interface MassReportScale {
  celebracao: string
  comunidade: { id: number; nome: string }
  celebrante: { id: number; nome: string } | null
}

export interface MassReportCommunity {
  comunidadeId: number
  nome: string
  missas: number
  celebracoesPalavra: number
  outras: number
}

export interface MassReportCelebrant {
  celebranteId: number
  nome: string
  tipo: CelebranteTipo
  missas: number
  celebracoesPalavra: number
}

export interface MassReport {
  totalMissas: number
  totalCelebracoesPalavra: number
  totalOutras: number
  porComunidade: MassReportCommunity[]
  porCelebrante: MassReportCelebrant[]
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const PRIEST_TITLES = new Set(['pe', 'padre', 'mons', 'monsenhor', 'dom'])
const DEACON_TITLES = new Set(['diac', 'diacono'])

export function celebranteTipo(nome: string): CelebranteTipo {
  const title = normalize(nome).split(/[\s.]+/)[0] ?? ''
  if (PRIEST_TITLES.has(title)) return 'padre'
  if (DEACON_TITLES.has(title)) return 'diacono'
  return 'outro'
}

export function celebrationKind(scale: Pick<MassReportScale, 'celebracao' | 'celebrante'>): CelebrationKind {
  const tipo = scale.celebrante ? celebranteTipo(scale.celebrante.nome) : 'outro'
  if (tipo === 'padre') return 'missa'
  if (tipo === 'diacono') return 'palavra'
  const name = normalize(scale.celebracao)
  if (name.includes('palavra')) return 'palavra'
  if (name.includes('missa')) return 'missa'
  return 'outra'
}

const byName = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR')

export function buildMassReport(scales: MassReportScale[]): MassReport {
  const communities = new Map<number, MassReportCommunity>()
  const celebrants = new Map<number, MassReportCelebrant>()
  const report: MassReport = { totalMissas: 0, totalCelebracoesPalavra: 0, totalOutras: 0, porComunidade: [], porCelebrante: [] }

  for (const scale of scales) {
    const kind = celebrationKind(scale)

    let community = communities.get(scale.comunidade.id)
    if (!community) {
      community = { comunidadeId: scale.comunidade.id, nome: scale.comunidade.nome, missas: 0, celebracoesPalavra: 0, outras: 0 }
      communities.set(scale.comunidade.id, community)
    }

    if (kind === 'missa') {
      report.totalMissas += 1
      community.missas += 1
    } else if (kind === 'palavra') {
      report.totalCelebracoesPalavra += 1
      community.celebracoesPalavra += 1
    } else {
      report.totalOutras += 1
      community.outras += 1
    }

    if (scale.celebrante && kind !== 'outra') {
      let celebrant = celebrants.get(scale.celebrante.id)
      if (!celebrant) {
        celebrant = {
          celebranteId: scale.celebrante.id,
          nome: scale.celebrante.nome,
          tipo: celebranteTipo(scale.celebrante.nome),
          missas: 0,
          celebracoesPalavra: 0,
        }
        celebrants.set(scale.celebrante.id, celebrant)
      }
      if (kind === 'missa') celebrant.missas += 1
      else celebrant.celebracoesPalavra += 1
    }
  }

  report.porComunidade = Array.from(communities.values()).sort(byName)
  // Priests first, then deacons, then anyone without a recognized title.
  const tipoOrder: Record<CelebranteTipo, number> = { padre: 0, diacono: 1, outro: 2 }
  report.porCelebrante = Array.from(celebrants.values()).sort((a, b) => tipoOrder[a.tipo] - tipoOrder[b.tipo] || byName(a, b))
  return report
}
