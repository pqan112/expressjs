import exitHook from 'async-exit-hook'
import express from 'express'
import { env } from './configs/environment'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { initUploadsFolder } from './utils/file'

const startApp = () => {
  const app = express()
  // initialize uploads folder
  initUploadsFolder()
  // middlewares
  app.use(express.json())
  // routers
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)
  app.use('/static', staticRouter)
  // use static file
  app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
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
