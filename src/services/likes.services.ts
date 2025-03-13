import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class LikesService {
  async likeTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
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
    const like = await databaseService.likes.findOne({ _id: result?._id })
    return like
  }

  async unlikeTweet(user_id: string, tweet_id: string) {
    await databaseService.likes.findOneAndDelete({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
  }
}

const likesService = new LikesService()
export default likesService
