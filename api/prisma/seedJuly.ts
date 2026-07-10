import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const YEAR = 2026
const MONTH = 6 // 0-indexed → julho

interface MassSlot { day: number; horario: string }

async function main() {
  const slots: MassSlot[] = []

  for (let day = 1; day <= 31; day++) {
    const date = new Date(Date.UTC(YEAR, MONTH, day))
    const dow = date.getUTCDay() // 0=Dom … 6=Sáb

    if (dow === 1) continue // Segunda: sem missa

    if (dow >= 2 && dow <= 5) {
      // Ter–Sex: 19h
      slots.push({ day, horario: '19:00' })
    } else if (dow === 6) {
      // Sáb: 18:30
      slots.push({ day, horario: '18:30' })
    } else if (dow === 0) {
      // Dom: 7:30, 9:30, 19h
      slots.push({ day, horario: '07:30' })
      slots.push({ day, horario: '09:30' })
      slots.push({ day, horario: '19:00' })
    }
  }

  console.log(`Gerando ${slots.length} missas para Julho 2026...`)
  let criadas = 0
  let puladas = 0

  for (const slot of slots) {
    const dataCelebracao = new Date(Date.UTC(YEAR, MONTH, slot.day))

    const exists = await prisma.scale.findFirst({
      where: { dataCelebracao, horario: slot.horario },
    })

    if (exists) { puladas++; continue }

    await prisma.scale.create({
      data: {
        dataCelebracao,
        horario: slot.horario,
        celebracao: 'Santa Missa',
        status: 'rascunho',
      },
    })
    criadas++
  }

  console.log(`✓ Criadas: ${criadas}  |  Já existiam: ${puladas}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
