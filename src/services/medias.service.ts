import { Request } from 'express'
import fs from 'fs'
import path from 'path'
// remove file EXIF and Metadata
import sharp from 'sharp'
import { env } from '~/configs/environment'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    // sharp.Sharp.toFile(fileOut: string) fileOut is upload directory
    // sharp.cache(false) to avoid operation not permitte when unlink filepath
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath)
    // after remove EXIF and metadata, remove this file in uploads/temp
    fs.unlinkSync(file.filepath)
    return {
      image: `http://localhost:${env.PORT}/${newName}.jpg`,
      orginal_image: file.originalFilename
    }
  }
}

const mediasService = new MediasService()

export default mediasService
