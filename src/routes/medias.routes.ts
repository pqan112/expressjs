import { Router } from 'express'
import formidable from 'formidable'
import path from 'path'
import { uploadSingleImageController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

// console.log(__dirname)
// C:\Users\**\**\**\expressjs\src\routes
// console.log(path.resolve('uploads'))
// C:\Users\**\**\**\expressjs\uploads

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediasRouter
