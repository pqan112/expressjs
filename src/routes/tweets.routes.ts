import { Router } from 'express'
import tweetController from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * description: create a tweet
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(tweetController.createTweet)
)

/**
 * description: Get tweet detail
 * method: GET
 * headers: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(tweetController.getTweet)
)

/**
 * description: Get tweet children (comment, retweet and quote tweet)
 * method: GET
 * headers: { Authorization?: Bearer <access_token> }
 * query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(tweetController.getTweetChildren)
)

/**
 * description: Get new feeds
 * method: GET
 * headers: { Authorization: Bearer <access_token> }
 * query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(tweetController.getNewFeeds)
)

export default tweetsRouter
