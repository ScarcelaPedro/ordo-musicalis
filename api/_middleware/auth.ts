import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
    servidorId?: number | null
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Não autenticado' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as { sub: number }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { servidor: { select: { id: true } } },
    })
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado' })

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      servidorId: user.servidor?.id ?? null,
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}
