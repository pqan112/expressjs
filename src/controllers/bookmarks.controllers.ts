import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import ResponseData from '~/models/ResponseData'
import bookmarksService from '~/services/bookmarks.services'

const bookmarkController = {
  bookmarkTweetController: async (
    req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
    res: Response
  ) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { tweet_id } = req.body
    const result = await bookmarksService.bookmarkTweet(user_id, tweet_id)
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: result,
        status: StatusCodes.OK,
        message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY
      })
    )
  },

  unbookmarkByTweetIdController: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { tweet_id } = req.params
    await bookmarksService.unbookmarkByTweetId(user_id, tweet_id)
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: null,
        status: StatusCodes.OK,
        message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
      })
    )
  },

  unbookmarkByBookmarkIdController: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { bookmark_id } = req.params
    await bookmarksService.unbookmarkByBookmarkId(user_id, bookmark_id)
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: null,
        status: StatusCodes.OK,
        message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
      })
    )
  },

  getBookmarksController: async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const result = await bookmarksService.getBookmarks(user_id)

    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: result,
        status: StatusCodes.OK,
        message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
      })
    )
  }
}

export default bookmarkController
