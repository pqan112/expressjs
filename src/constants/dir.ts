import path from 'path'
// __dirname C:\Users\**\**\**\expressjs\src\routes
// path.resolve('uploads') C:\Users\**\**\**\expressjs\uploads
export const UPLOAD_IMAGE_TEMP_DIR = path.resolve('uploads/images/temp')
export const UPLOAD_IMAGE_DIR = path.resolve('uploads/images')
export const UPLOAD_VIDEO_TEMP_DIR = path.resolve('uploads/videos/temp')
export const UPLOAD_VIDEO_DIR = path.resolve('uploads/videos')
