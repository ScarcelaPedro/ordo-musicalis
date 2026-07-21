import { Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from './auth'

const prisma = new PrismaClient()

/**
 * Restricts write access to resources belonging to a ministério (Team).
 * `admin` bypasses entirely. `coordenador` is only allowed through when the
 * team resolved by `resolveTeamId` has `responsavelId` equal to their own
 * musicianId. Any other role is rejected (mirrors requireRole's 403).
 *
 * `resolveTeamId` returns:
 *  - a number: the teamId to check ownership against
 *  - null: no team associated (only admin may proceed)
 */
export function requireTeamOwnership(resolveTeamId: (req: AuthRequest) => Promise<number | null>) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Não autenticado' })
    if (req.user.role === 'admin') return next()
    if (req.user.role !== 'coordenador') {
      return res.status(403).json({ message: 'Sem permissão para esta ação' })
    }

    const teamId = await resolveTeamId(req)
    if (teamId === null) {
      return res.status(403).json({ message: 'Apenas administradores podem gerenciar este recurso' })
    }

    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { responsavelId: true } })
    if (!team || !req.user.musicianId || team.responsavelId !== req.user.musicianId) {
      return res.status(403).json({ message: 'Você só pode gerenciar recursos do seu próprio ministério' })
    }
    next()
  }
}
