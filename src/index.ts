import express from 'express'
import { env } from './configs/environment'
import usersRouter from './routes/users.routes'
const app = express()

// routers
app.use(express.json())
app.use('/users', usersRouter)

app.listen(env.PORT, () => {
  console.log(`App is running on http://localhost:${env.PORT}`)
})
