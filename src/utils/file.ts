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
