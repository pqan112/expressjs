import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import ResponseData from '~/models/ResponseData'
import mediasService from '~/services/medias.service'
import fs from 'fs'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadImage(req)

  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.UPLOAD_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadVideo(req)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.UPLOAD_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const filePath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // Check if file exists before streaming
  if (!fs.existsSync(filePath)) {
    res.status(StatusCodes.NOT_FOUND).send('File not found')
    return
  }

  const stream = fs.createReadStream(filePath)
  stream.on('error', (err) => {
    console.error('File streaming error:', err)
    if (!res.headersSent) {
      next('Error streaming file')
      return
    }
  })
  // Handle client disconnects to avoid "ECANCELED" errors
  // Xử lý khi client đóng kết nối
  req.on('close', () => {
    console.log(`Client disconnected while streaming ${name}`)
    stream.destroy() // Dừng stream ngay lập tức
  })

  res.setHeader('Content-Type', 'video/mp4')
  stream.pipe(res)
}
