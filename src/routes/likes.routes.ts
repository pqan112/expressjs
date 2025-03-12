import { Router } from 'express'
import { likeTweetController } from '~/controllers/likes.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * description: like a tweet
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * body: { tweet_id: string }
 */
likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(likeTweetController)
)

export default likesRouter
