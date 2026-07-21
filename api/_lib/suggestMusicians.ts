import { PrismaClient } from '@prisma/client'

interface SuggestParams {
  data: string
  horario: string
  teamId?: number | null
  instrumentId?: number | null
  excludeIds?: number[]
}

export interface Suggestion {
  musicianId: number
  nome: string
  nivel: string
  score: number
  motivo: string
}

function periodoFromHorario(horario: string): 'manha' | 'tarde' | 'noite' {
  const hour = Number(horario.split(':')[0])
  if (hour < 12) return 'manha'
  if (hour < 18) return 'tarde'
  return 'noite'
}

export async function suggestMusicians(prisma: PrismaClient, params: SuggestParams): Promise<Suggestion[]> {
  const { data, horario, teamId, instrumentId, excludeIds = [] } = params
  const date = new Date(`${data}T12:00:00`)
  const diaSemana = date.getDay()
  const periodo = periodoFromHorario(horario)

  const trintaDiasAtras = new Date()
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

  const musicians = await prisma.musician.findMany({
    where: {
      ativo: true,
      id: { notIn: excludeIds },
      ...(instrumentId ? { instruments: { some: { instrumentId } } } : {}),
      ...(teamId ? { teams: { some: { teamId } } } : {}),
    },
    include: {
      availabilities: true,
      vinculosFixos: { where: { ativo: true }, include: { scaleTemplate: true } },
      scales: { include: { scale: true } },
    },
  })

  const scored: Suggestion[] = []

  for (const m of musicians) {
    const disponibilidade =
      m.availabilities.find(
        (a) => a.tipo === 'data_especifica' && a.data && a.data.toISOString().slice(0, 10) === data && a.periodo === periodo
      ) ??
      m.availabilities.find((a) => a.tipo === 'recorrente_semanal' && a.diaSemana === diaSemana && a.periodo === periodo)

    // Quem marcou explicitamente indisponível nesse dia/período não entra na sugestão.
    if (disponibilidade && !disponibilidade.disponivel) continue

    let score = 0
    const motivos: string[] = []

    if (disponibilidade?.disponivel) {
      score += 50
      motivos.push('Disponível nesse dia/período')
    }

    const vinculo = m.vinculosFixos.find(
      (v) => v.scaleTemplate.horario === horario && v.scaleTemplate.diaSemana === diaSemana
    )
    if (vinculo) {
      score += 30
      motivos.push('Vínculo fixo compatível')
    }

    const recentCount = m.scales.filter((sm) => sm.scale.dataCelebracao >= trintaDiasAtras).length
    score -= recentCount
    if (recentCount > 0) motivos.push(`Escalado ${recentCount}x nos últimos 30 dias`)

    scored.push({
      musicianId: m.id,
      nome: m.nome,
      nivel: m.nivel,
      score,
      motivo: motivos.join('; ') || 'Sem disponibilidade declarada para esse dia/período',
    })
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 5)
}
