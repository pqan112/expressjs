import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { TweetType } from '~/constants/enum'
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
    const result = await tweetsService.increaseView(
      req.params.tweet_id,
      req.decoded_authorization?.user_id,
      req.author
    )
    const tweet = {
      ...req.tweet,
      guest_views: result.guest_views,
      user_views: result.user_views,
      updated_at: result.updated_at
    }
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: tweet,
        status: StatusCodes.OK,
        message: TWEETS_MESSAGES.GET_SUCCESSFULLY
      })
    )
  },

  getTweetChildren: async (req: Request, res: Response) => {
    const { tweet_id } = req.params
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const tweet_type = Number(req.query.tweet_type) as TweetType
    const author = req.author
    const user_id = req.decoded_authorization?.user_id
    const { tweets, total_documents } = await tweetsService.getTweetChildren({
      tweet_id,
      limit,
      page,
      tweet_type,
      author,
      user_id
    })

    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: {
          tweets,
          page,
          limit,
          total_documents,
          total_page: Math.ceil(total_documents / limit)
        },
        status: StatusCodes.OK,
        message: TWEETS_MESSAGES.GET_SUCCESSFULLY
      })
    )
  }
}

export default tweetController
