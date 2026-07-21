import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import cors from 'cors'
import authRoutes from './_routes/auth'
import musicianRoutes from './_routes/musicians'
import teamRoutes from './_routes/teams'
import scaleRoutes from './_routes/scales'
import scaleTemplateRoutes from './_routes/scaleTemplates'
import repertoireRoutes from './_routes/repertoire'
import repertoireItemRoutes from './_routes/repertoireItems'
import availabilityRoutes from './_routes/availability'
import availabilityWindowRoutes from './_routes/availabilityWindows'
import vinculoFixoRoutes from './_routes/vinculosFixos'
import profileRoutes from './_routes/profile'
import instrumentRoutes from './_routes/instruments'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/musicians', musicianRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/scales', scaleRoutes)
app.use('/api/scale-templates', scaleTemplateRoutes)
app.use('/api/scales/:scaleId/repertoire/items', repertoireItemRoutes)
app.use('/api/scales/:scaleId/repertoire', repertoireRoutes)
app.use('/api/availability-windows', availabilityWindowRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/vinculos-fixos', vinculoFixoRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/instruments', instrumentRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  if (err?.code === 'P2025') return res.status(404).json({ message: 'Registro não encontrado' })
  if (err?.code === 'P2002') return res.status(422).json({ message: 'Já existe um registro com esse valor' })
  if (err?.code === 'P2003') return res.status(422).json({ message: 'Operação inválida: registro relacionado não encontrado' })
  return res.status(500).json({ message: 'Erro interno no servidor' })
})

export default app
