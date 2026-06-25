import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissão para esta ação' })
    }
    next()
  }
}
