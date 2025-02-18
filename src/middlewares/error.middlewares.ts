import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(err)
    return
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  // TODO: if dev env keep stackTrace, if other envs remove stackTrace

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: err
  })
}
