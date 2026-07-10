import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const instruments = [
    'Violão', 'Teclado/Piano', 'Voz', 'Bateria',
    'Baixo', 'Flauta', 'Violino', 'Cajón',
  ]

  await prisma.instrument.createMany({
    data: instruments.map((nome) => ({ nome })),
    skipDuplicates: true,
  })
  console.log('Instrumentos criados')

  const hash = await bcrypt.hash('password', 12)
  await prisma.user.upsert({
    where: { email: 'admin@escaladmusicos.test' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@escaladmusicos.test',
      password: hash,
      role: 'admin',
      emailVerifiedAt: new Date(),
    },
  })
  console.log('Admin criado: admin@escaladmusicos.test / password')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
