import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import ResponseData from '~/models/ResponseData'
import tweetsService from '~/services/tweets.services'

const tweetController = {
  createTweet: async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await tweetsService.createTweet(user_id, req.body)

    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: result,
        status: StatusCodes.OK,
        message: TWEETS_MESSAGES.CREATE_SUCCESSFULLY
      })
    )
  },

  getTweet: async (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: null,
        status: StatusCodes.OK,
        message: TWEETS_MESSAGES.GET_SUCCESSFULLY
      })
    )
  }
}

export default tweetController
