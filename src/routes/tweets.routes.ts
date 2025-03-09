import { Router } from 'express'
import { tweetController } from '~/controllers/tweets.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
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
  wrapRequestHandler(tweetController)
)

export default tweetsRouter
