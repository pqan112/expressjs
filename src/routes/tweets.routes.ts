import { Router } from 'express'
import tweetController from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
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

export default tweetsRouter
