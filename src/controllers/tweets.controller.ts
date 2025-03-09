import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'

export const tweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  res.status(StatusCodes.OK).json('tweet controller')
}
