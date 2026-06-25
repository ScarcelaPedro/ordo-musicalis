import 'dotenv/config'
import app from './index'

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`)
})
