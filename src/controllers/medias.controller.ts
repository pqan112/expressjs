import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import mediasService from '~/services/medias.service'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadSingleImage(req)
  res.status(StatusCodes.OK).json(result)
}
