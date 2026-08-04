import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  await prisma.comunidade.upsert({
    where: { id: 1 },
    update: {},
    create: { nome: 'Matriz' },
  })
  console.log('Comunidade "Matriz" criada')

  const categorias = [
    { nome: 'Música', ordem: 1 },
    { nome: 'Ministros da Comunhão', ordem: 2 },
    { nome: 'Acólitos e Ancilas', ordem: 3 },
    { nome: 'Leitores', ordem: 4 },
    { nome: 'Comentaristas', ordem: 5 },
  ]
  for (const categoria of categorias) {
    const existing = await prisma.categoriaFuncao.findFirst({ where: { nome: categoria.nome } })
    if (!existing) await prisma.categoriaFuncao.create({ data: categoria })
  }
  console.log('Categorias de função criadas')

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
