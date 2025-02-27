import exitHook from 'async-exit-hook'
import express from 'express'
import { env } from './configs/environment'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import mediasRouter from './routes/medias.routes'
import { initUploadsFolder } from './utils/file'

const startApp = () => {
  // initialize uploads folder
  initUploadsFolder()

  const app = express()
  // middlewares
  app.use(express.json())
  // routers
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)
  // global error handler
  app.use(defaultErrorHandler)

  app.listen(env.PORT, () => {
    console.log(`3. App is running on http://localhost:${env.PORT}`)
  })

  exitHook(async () => {
    console.log('4. Disconnecting to MongoDB')
    databaseService.closeDB()
  })
}

;(async () => {
  try {
    console.log('1. Connecting to MongoDB')
    databaseService.connect()
    console.log('2. Connected successfully to MongoDB')
    startApp()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
