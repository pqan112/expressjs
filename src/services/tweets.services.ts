import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import User from '~/models/schemas/User.schema'

class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hastag) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hastag
          },
          {
            $setOnInsert: new Hashtag({
              name: hastag
            })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        medias: body.medias,
        mentions: body.mentions,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  async increaseView(tweet_id: string, user_id?: string, author?: User) {
    // nếu người xem không phải là tác giả và không đăng nhập thì tăng guest_views
    // nếu người xem đã đăng nhập và không phải là tác giả thì tăng user_views
    const $inc = author?._id?.equals(user_id)
      ? {}
      : user_id
        ? { user_views: 1 }
        : { guest_views: 1 }
    console.log(author?._id, user_id)
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )

    return result as WithId<{
      guest_views: number
      user_views: number
    }>
  }
}

const tweetsService = new TweetsService()
export default tweetsService
