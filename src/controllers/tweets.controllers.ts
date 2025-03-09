import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import ResponseData from '~/models/ResponseData'
import tweetsService from '~/services/tweets.services'

export const tweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)

  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      status: StatusCodes.OK,
      message: 'Create tweet successfully'
    })
  )
}
