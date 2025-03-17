import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import User from '~/models/schemas/User.schema'
import { TweetType } from '~/constants/enum'

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

  async increaseView(tweet_id: string, user_id?: string, author?: User | null) {
    // nếu người xem không phải là tác giả và không đăng nhập thì tăng guest_views
    // nếu người xem đã đăng nhập và không phải là tác giả thì tăng user_views
    const inc = author?._id?.equals(user_id) ? {} : user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )

    return result as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }

  async getTweetChildren({
    tweet_id,
    page,
    limit,
    tweet_type,
    user_id,
    author
  }: {
    tweet_id: string
    page: number
    limit: number
    tweet_type: TweetType
    user_id?: string
    author?: User | null
  }) {
    // const tweets = await  databaseService.tweets
    //   .aggregate<Tweet>([
    //     {
    //       $match: {
    //         parent_id: new ObjectId(tweet_id),
    //         type: tweet_type
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'hashtags',
    //         localField: 'hashtags',
    //         foreignField: '_id',
    //         as: 'hashtags'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'mentions',
    //         foreignField: '_id',
    //         as: 'mentions'
    //       }
    //     },
    //     {
    //       $addFields: {
    //         mentions: {
    //           $map: {
    //             input: '$mentions',
    //             as: 'mention',
    //             in: {
    //               _id: '$$mention._id',
    //               name: '$$mention.name',
    //               email: '$$mention.email',
    //               username: '$$mention.username'
    //             }
    //           }
    //         }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'bookmarks',
    //         localField: '_id',
    //         foreignField: 'tweet_id',
    //         as: 'bookmarks'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'likes',
    //         localField: '_id',
    //         foreignField: 'tweet_id',
    //         as: 'likes'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'tweets',
    //         localField: '_id',
    //         foreignField: 'parent_id',
    //         as: 'tweet_children'
    //       }
    //     },
    //     {
    //       $addFields: {
    //         bookmark_count: {
    //           $size: '$bookmarks'
    //         },
    //         like_count: {
    //           $size: '$likes'
    //         },
    //         retweet_count: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'item',
    //               cond: {
    //                 $eq: ['$$item.type', TweetType.Retweet]
    //               }
    //             }
    //           }
    //         },
    //         comment_count: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'item',
    //               cond: {
    //                 $eq: ['$$item.type', TweetType.Comment]
    //               }
    //             }
    //           }
    //         },
    //         quote_count: {
    //           $size: {
    //             $filter: {
    //               input: '$tweet_children',
    //               as: 'item',
    //               cond: {
    //                 $eq: ['$$item.type', TweetType.QuoteTweet]
    //               }
    //             }
    //           }
    //         }
    //       }
    //     },
    //     {
    //       $project: {
    //         bookmarks: 0,
    //         likes: 0,
    //         tweet_children: 0
    //       }
    //     },
    //     {
    //       $skip: (page - 1) * limit
    //     },
    //     {
    //       $limit: limit
    //     }
    //   ])
    //   .toArray()

    // const total = await databaseService.tweets.countDocuments({
    //   parent_id: new ObjectId(tweet_id),
    //   type: tweet_type
    // })

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              parent_id: new ObjectId(tweet_id),
              type: tweet_type
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    email: '$$mention.email',
                    username: '$$mention.username'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $addFields: {
              bookmark_count: {
                $size: '$bookmarks'
              },
              like_count: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.QuoteTweet]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              bookmarks: 0,
              likes: 0,
              tweet_children: 0
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    const inc = author?._id?.equals(user_id) ? {} : user_id ? { user_views: 1 } : { guest_views: 1 }
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    // do updateMany không return về result nên phải update manually
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        // không dùng currentDate, nên dùng set để update date cho đồng bộ với kết quả trả về
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (author?._id?.equals(user_id)) return
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return { tweets, total_documents: total }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
