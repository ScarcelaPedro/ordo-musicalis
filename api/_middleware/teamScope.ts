import { Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from './auth'

const prisma = new PrismaClient()

/**
 * Restricts write access to resources belonging to a ministério (Team).
 * `admin` bypasses entirely. `coordenador` is only allowed through when the
 * team resolved by `resolveTeamId` has `responsavelId` equal to their own
 * servidorId. Any other role is rejected (mirrors requireRole's 403).
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
    if (!team || !req.user.servidorId || team.responsavelId !== req.user.servidorId) {
      return res.status(403).json({ message: 'Você só pode gerenciar recursos do seu próprio ministério' })
    }
    next()
  }
}

/**
 * Como requireTeamOwnership, mas contra uma lista de ministérios em vez de um só -- útil pra
 * celebrações desde a Fase 2, onde não existe mais "o" ministério da escala: cada servidor
 * escalado carrega o seu próprio. Passa quem coordena QUALQUER um dos ministérios resolvidos.
 */
export function requireAnyTeamOwnership(resolveTeamIds: (req: AuthRequest) => Promise<number[]>) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Não autenticado' })
    if (req.user.role === 'admin') return next()
    if (req.user.role !== 'coordenador') {
      return res.status(403).json({ message: 'Sem permissão para esta ação' })
    }

    const teamIds = await resolveTeamIds(req)
    if (!teamIds.length) {
      return res.status(403).json({ message: 'Apenas administradores podem gerenciar este recurso' })
    }

    const teams = await prisma.team.findMany({ where: { id: { in: teamIds } }, select: { responsavelId: true } })
    const isOwner = req.user.servidorId != null && teams.some((t) => t.responsavelId === req.user!.servidorId)
    if (!isOwner) {
      return res.status(403).json({ message: 'Você só pode gerenciar celebrações com algum ministério seu escalado' })
    }
    next()
  }
}
