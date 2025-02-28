import { Request } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const initUploadsFolder = () => {
  const uploadFolderPath = path.resolve('uploads')

  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // muốn tạo nested folder thì phải có recursive: true không thì sẽ bị ăn chửi, vd: uploads/images hoặc uploads/videos
    })
  }
}

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 300 * 1024, // 300KB
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      // keep only images
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        return false
      }
      console.log('1')
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log('fields', fields)
      console.log('files', files)
      console.log('err', err)

      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files)
    })
  })
}
