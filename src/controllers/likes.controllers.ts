import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LikeTweetRequestBody } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import ResponseData from '~/models/ResponseData'
import likesService from '~/services/likes.services'

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likesService.likeTweet(user_id, tweet_id)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      status: StatusCodes.OK,
      message: LIKE_MESSAGES.LIKE_SUCCESSFULLY
    })
  )
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await likesService.unlikeTweet(user_id, tweet_id)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      status: StatusCodes.OK,
      message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY
    })
  )
}
