import { Router } from 'express'
import bookmarkController from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * description: bookmark a tweet
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * body: { tweet_id: string }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController.bookmarkTweetController)
)

/**
 * description: unbookmark a tweet by tweet id
 * method: DELETE
 * headers: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController.unbookmarkByTweetIdController)
)

/**
 * description: get bookmark list
 * method: GET
 * headers: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(bookmarkController.getBookmarksController)
)

/**
 * description: unbookmark a tweet by bookmark id
 * method: DELETE
 * headers: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(bookmarkController.unbookmarkByBookmarkIdController)
)

export default bookmarksRouter
