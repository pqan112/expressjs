import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { USERS_MESSAGES } from '~/constants/messages'
import ResponseData from '~/models/ResponseData'
import mediasService from '~/services/medias.service'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadImage(req)

  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.UPLOAD_SUCCESS,
      status: StatusCodes.OK
    })
  )
}
