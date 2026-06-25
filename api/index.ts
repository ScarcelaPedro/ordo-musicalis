import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import musicianRoutes from './routes/musicians'
import teamRoutes from './routes/teams'
import scaleRoutes from './routes/scales'
import repertoireRoutes from './routes/repertoire'
import repertoireItemRoutes from './routes/repertoireItems'
import availabilityRoutes from './routes/availability'
import profileRoutes from './routes/profile'

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
app.use('/api/scales/:scaleId/repertoire/items', repertoireItemRoutes)
app.use('/api/scales/:scaleId/repertoire', repertoireRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/profile', profileRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

export default app
