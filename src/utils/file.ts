import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initUploadsFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // muốn tạo nested folder thì phải có recursive: true không thì sẽ bị ăn chửi, vd: uploads/images hoặc uploads/videos
      })
    }
  })
}

export const handleUploadImage = (req: Request) => {
  const MAX_FILES = 4
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
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

export const handleUploadVideo = (req: Request) => {
  const MAX_FILES = 1
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: MAX_FILES,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: function ({ name, originalFilename, mimetype }) {
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`)
        video.newFilename = `${video.newFilename}.${ext}`
      })
      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const nameArray = fullname.split('.')
  nameArray.pop()
  return nameArray.join('')
}

export const getExtension = (fullname: string) => {
  const nameArray = fullname.split('.')
  return nameArray[nameArray.length - 1]
}
