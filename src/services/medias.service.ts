import { Request } from 'express'
import fs from 'fs'
import path from 'path'
// remove file EXIF and Metadata
import sharp from 'sharp'
import { env } from '~/configs/environment'
import { isProduction } from '~/constants/config'
import { UPLOAD_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Media'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
        // sharp.Sharp.toFile(fileOut: string) fileOut is upload directory
        // sharp.cache(false) to avoid operation not permitte when unlink filepath
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)
        // after remove EXIF and metadata, remove this file in uploads/temp
        fs.unlinkSync(file.filepath)
        const url = isProduction
          ? `${env.HOST}/medias/${newName}.jpg`
          : `http://localhost:${env.PORT}/medias/${newName}.jpg`

        return {
          url,
          original_name: file.originalFilename as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
