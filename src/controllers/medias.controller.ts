import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import ResponseData from '~/models/ResponseData'
import mediasService from '~/services/medias.service'
import fs from 'fs'
import mime from 'mime'

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

export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
  if (!range) {
    res.status(StatusCodes.BAD_REQUEST).send('Requires Range header')
    return
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10*6 bytes (tính theo hệ 10, đây là thứ mà chúng ta thấy trên UI)
  // tính theo hệ nhị phân thì 1MB = 2^20 bytes (1024 * 1024)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 10 ** 6 // 1MB

  /* Yêu cầu Content-Range là end phải luôn nhỏ hơn videoSize
    ❌ 'Content-Range': 'bytes 0-100/100' video sẽ load mà không play được
    ✅ 'Content-Range': 'bytes 0-99/100'
  */

  /* Content-Length sẽ là end - start + 1. Đại diện cho khoảng cách
     Từ số 0 đến số 10 thì chúng ta có 11 con số
     Byte cũng tương tự nếu start=0, end=10 thì chúng ta có 11 byte
     => Công thức là end - start + 1
  */

  /*
     VD: chunkSize=50, videoSize = 100
     |0---------------50|51-------------99|100(end)
     stream 1: start=0, end=50, contentLength=51
     stream 2: start=51, end=99, contentLength=49
  */

  const start = Number(range.replace(/\D/g, '')) // 'bytes=1048576-' -> 104876
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  // thường sẽ là chunkSize, trừ đoạn cuối nếu start + chunkSize vượt quá videoSize thì end lúc này là videoSize
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(StatusCodes.PARTIAL_CONTENT, headers)
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}
