import exitHook from 'async-exit-hook'
import express from 'express'
import { env } from './configs/environment'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { initUploadsFolder } from './utils/file'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
// import '~/utils/fake'
import cors, { CorsOptions } from 'cors'
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'
import path from 'path'
import YAML from 'yaml'

const corOptions: CorsOptions = {
  origin: '*'
}

const swaggerFile = readFileSync(path.resolve('swagger.yml'), 'utf-8')
const swaggerDocument = YAML.parse(swaggerFile)

const startApp = () => {
  const app = express()
  // initialize uploads folder
  initUploadsFolder()
  // middlewares
  app.use(express.json())
  app.use(cors(corOptions))

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  // routers
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)
  app.use('/tweets', tweetsRouter)
  app.use('/bookmarks', bookmarksRouter)
  app.use('/likes', likesRouter)
  // custom use static file
  app.use('/static', staticRouter)
  // use static file default of Expressjs
  // app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
  // global error handler
  app.use(defaultErrorHandler)

  app.listen(env.PORT, () => {
    console.log(`4. App is running on http://localhost:${env.PORT}`)
  })

  exitHook(async () => {
    console.log('5. Disconnecting to MongoDB')
    databaseService.closeDB()
  })
}

;(async () => {
  try {
    console.log('1. Connecting to MongoDB')
    await databaseService.connect()
    console.log('2. Connected successfully to MongoDB')
    console.log('3. Index collections')
    await Promise.all([
      databaseService.indexUsers(),
      databaseService.indexRefreshTokens(),
      databaseService.indexFollowers()
    ])

    startApp()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
