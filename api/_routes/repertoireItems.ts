import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import { put, del } from '@vercel/blob'
import { authenticate, AuthRequest } from '../_middleware/auth'
import { requireRole } from '../_middleware/roles'

const router = Router({ mergeParams: true })
const prisma = new PrismaClient()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.post(
  '/',
  authenticate,
  requireRole('admin', 'coordenador'),
  upload.single('pdf'),
  async (req: AuthRequest, res: Response) => {
    const scaleId = Number(req.params.scaleId)

    const repertoire = await prisma.repertoire.findUnique({ where: { scaleId } })
    if (!repertoire) return res.status(404).json({ message: 'Repertório não encontrado' })

    const maxOrdem = await prisma.repertoireItem.aggregate({
      where: { repertoireId: repertoire.id },
      _max: { ordem: true },
    })

    let arquivoPdfPath: string | null = null
    if (req.file) {
      const blob = await put(`partituras/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
        access: 'public',
        contentType: 'application/pdf',
      })
      arquivoPdfPath = blob.url
    }

    const item = await prisma.repertoireItem.create({
      data: {
        repertoireId: repertoire.id,
        ordem: (maxOrdem._max.ordem ?? 0) + 1,
        tituloMusica: req.body.tituloMusica,
        tom: req.body.tom ?? null,
        linkExterno: req.body.linkExterno ?? null,
        arquivoPdfPath,
      },
    })
    return res.status(201).json(item)
  },
)

router.patch(
  '/:itemId',
  authenticate,
  requireRole('admin', 'coordenador'),
  upload.single('pdf'),
  async (req: AuthRequest, res: Response) => {
    const item = await prisma.repertoireItem.findUnique({ where: { id: Number(req.params.itemId) } })
    if (!item) return res.status(404).json({ message: 'Item não encontrado' })

    let arquivoPdfPath = item.arquivoPdfPath
    if (req.file) {
      if (arquivoPdfPath) await del(arquivoPdfPath)
      const blob = await put(`partituras/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
        access: 'public',
        contentType: 'application/pdf',
      })
      arquivoPdfPath = blob.url
    }

    const updated = await prisma.repertoireItem.update({
      where: { id: item.id },
      data: {
        tituloMusica: req.body.tituloMusica ?? item.tituloMusica,
        tom: req.body.tom ?? item.tom,
        linkExterno: req.body.linkExterno ?? item.linkExterno,
        ordem: req.body.ordem !== undefined ? Number(req.body.ordem) : item.ordem,
        arquivoPdfPath,
      },
    })
    return res.json(updated)
  },
)

router.delete('/:itemId', authenticate, requireRole('admin', 'coordenador'), async (req: AuthRequest, res: Response) => {
  const item = await prisma.repertoireItem.findUnique({ where: { id: Number(req.params.itemId) } })
  if (!item) return res.status(404).json({ message: 'Item não encontrado' })

  if (item.arquivoPdfPath) await del(item.arquivoPdfPath)
  await prisma.repertoireItem.delete({ where: { id: item.id } })
  return res.status(204).send()
})

router.get('/:itemId/download', authenticate, async (req: AuthRequest, res: Response) => {
  const item = await prisma.repertoireItem.findUnique({ where: { id: Number(req.params.itemId) } })
  if (!item?.arquivoPdfPath) return res.status(404).json({ message: 'Arquivo não encontrado' })
  return res.redirect(item.arquivoPdfPath)
})

export default router
