import { PrismaClient } from '@prisma/client'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE
const configured = Boolean(EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE)

// Evolution API/Baileys esperam DDI+DDD+número só com dígitos (ex: 5538999998888).
// Números cadastrados no sistema costumam vir formatados (com parênteses, traço etc.).
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('55') && digits.length >= 12) return digits
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits.length >= 12 ? digits : null
}

async function sendWhatsappToNumber(rawPhone: string, text: string) {
  if (!configured) return
  const number = normalizePhone(rawPhone)
  if (!number) return

  try {
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY! },
      body: JSON.stringify({ number, text }),
    })
    if (!res.ok) {
      console.error('Falha ao enviar WhatsApp:', res.status, await res.text())
    }
  } catch (err) {
    console.error('Falha ao enviar WhatsApp:', err)
  }
}

export async function sendWhatsappToServidores(prisma: PrismaClient, servidorIds: number[], text: string) {
  if (!configured || !servidorIds.length) return
  const servidores = await prisma.servidor.findMany({
    where: { id: { in: servidorIds }, telefone: { not: null } },
    select: { telefone: true },
  })
  await Promise.all(servidores.map((s) => sendWhatsappToNumber(s.telefone!, text)))
}

export async function sendWhatsappToStaff(prisma: PrismaClient, teamId: number | null, text: string) {
  if (!configured) return
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { servidor: { select: { telefone: true } } },
  })
  const telefones = new Set<string>()
  for (const a of admins) if (a.servidor?.telefone) telefones.add(a.servidor.telefone)

  if (teamId) {
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { responsavel: { select: { telefone: true } } } })
    if (team?.responsavel?.telefone) telefones.add(team.responsavel.telefone)
  }

  await Promise.all(Array.from(telefones).map((t) => sendWhatsappToNumber(t, text)))
}
