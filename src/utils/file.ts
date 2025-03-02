import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initUploadsFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // muốn tạo nested folder thì phải có recursive: true không thì sẽ bị ăn chửi, vd: uploads/images hoặc uploads/videos
    })
  }
}

export const handleUploadImage = (req: Request) => {
  const MAX_FILES = 4

  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: MAX_FILES,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 300 * 1024 * MAX_FILES,
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      // keep only images
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        return false
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const nameArray = fullname.split('.')
  nameArray.pop()
  return nameArray.join('')
}
