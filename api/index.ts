import express from 'express'
import cors from 'cors'
import authRoutes from './_routes/auth'
import musicianRoutes from './_routes/musicians'
import teamRoutes from './_routes/teams'
import scaleRoutes from './_routes/scales'
import scaleTemplateRoutes from './_routes/scaleTemplates'
import repertoireRoutes from './_routes/repertoire'
import repertoireItemRoutes from './_routes/repertoireItems'
import availabilityRoutes from './_routes/availability'
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
app.use('/api/availability', availabilityRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/instruments', instrumentRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

export default app
