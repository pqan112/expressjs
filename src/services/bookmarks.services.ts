import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class BookmarksService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        tweet_id: new ObjectId(tweet_id),
        user_id: new ObjectId(user_id)
      },
      {
        $setOnInsert: new Bookmark({
          tweet_id: new ObjectId(tweet_id),
          user_id: new ObjectId(user_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    const bookmark = await databaseService.bookmarks.findOne({ _id: result?._id })
    return bookmark
  }

  async unbookmarkByTweetId(user_id: string, tweet_id: string) {
    await databaseService.bookmarks.findOneAndDelete({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
  }

  async unbookmarkByBookmarkId(user_id: string, bookmark_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      _id: new ObjectId(bookmark_id),
      user_id: new ObjectId(user_id)
    })
    return result
  }

  async getBookmarks(user_id: string) {
    const result = await databaseService.bookmarks
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()
    return result
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
