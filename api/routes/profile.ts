import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  return res.json(user)
})

router.patch('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, email, currentPassword, newPassword } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(422).json({ message: 'Senha atual incorreta' })
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 12) } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  })
  return res.json(updated)
})

router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { password } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  if (!password || !(await bcrypt.compare(password, user.password))) {
    return res.status(422).json({ message: 'Senha incorreta' })
  }

  await prisma.user.delete({ where: { id: user.id } })
  return res.status(204).send()
})

export default router
