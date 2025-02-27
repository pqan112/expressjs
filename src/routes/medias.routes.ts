import { Router } from 'express'
import formidable from 'formidable'
import path from 'path'

// console.log(__dirname)
// C:\Users\**\**\**\expressjs\src\routes
// console.log(path.resolve('uploads'))
// C:\Users\**\**\**\expressjs\uploads

const mediasRouter = Router()

mediasRouter.post('/upload-image', (req, res, next) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 300 * 1024, // 300KB
    keepExtensions: true
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    res.json({ message: 'Upload successfully' })
  })
})

export default mediasRouter
