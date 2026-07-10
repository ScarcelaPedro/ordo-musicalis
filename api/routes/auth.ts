import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Resend } from 'resend'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

function signToken(userId: number) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
  })
}

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(422).json({ message: 'Nome, email e senha são obrigatórios' })
  }
  if (password.length < 8) {
    return res.status(422).json({ message: 'A senha deve ter pelo menos 8 caracteres' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(422).json({ message: 'Este email já está em uso' })
  }

  const hash = await bcrypt.hash(password, 12)
  const { user, musician } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password: hash },
    })
    const musician = await tx.musician.create({
      data: { nome: name, email, userId: user.id },
    })
    return { user, musician }
  })

  const token = signToken(user.id)
  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      musicianId: musician.id,
    },
  })
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(422).json({ message: 'Email e senha são obrigatórios' })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { musician: { select: { id: true } } },
  })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas' })
  }

  const token = signToken(user.id)
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      musicianId: user.musician?.id ?? null,
    },
  })
})

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { musician: { select: { id: true } } },
  })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    musicianId: user.musician?.id ?? null,
  })
})

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  // Sempre retorna 200 para não expor se email existe
  if (!user) return res.json({ message: 'Se o email existir, um link foi enviado.' })

  const token = crypto.randomBytes(32).toString('hex')
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    },
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Redefinição de senha — Ordo Musicalis',
    html: `<p>Clique no link para redefinir sua senha:</p><a href="${resetUrl}">${resetUrl}</a><p>Expira em 1 hora.</p>`,
  })

  return res.json({ message: 'Se o email existir, um link foi enviado.' })
})

router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, token, password } = req.body
  if (!email || !token || !password) {
    return res.status(422).json({ message: 'Dados incompletos' })
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      passwordResetToken: token,
      passwordResetAt: { gt: new Date() },
    },
  })
  if (!user) return res.status(422).json({ message: 'Token inválido ou expirado' })

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, passwordResetToken: null, passwordResetAt: null },
  })

  return res.json({ message: 'Senha redefinida com sucesso' })
})

export default router
