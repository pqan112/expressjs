import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'
import isEmpty from 'lodash/isEmpty'
import { Media } from '~/models/Media'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import Tweet from '~/models/schemas/Tweet.schema'
import { TokenPayload } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'
import User from '~/models/schemas/User.schema'

const tweetTypes = numberEnumToArray(TweetType)
const audienceTypes = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

const limitSchema: ParamSchema = {
  isNumeric: true,
  custom: {
    options: (value, { req }) => {
      const num = Number(value)
      if (num > 100 || num < 1) {
        throw new Error('1 <= limit <= 100')
      }
      return true
    }
  }
}

const pageSchema: ParamSchema = {
  isNumeric: true,
  custom: {
    options: (value, { req }) => {
      const num = Number(value)
      if (num < 1) {
        throw new Error('1 <= page')
      }
      return true
    }
  }
}

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes.join(',')],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [audienceTypes.join(',')],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      // nếu type là retweet, comment hoặc quotetweet thì phải truyền parent_id không thì có thể để null
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }
            if (type === TweetType.Tweet && value !== null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      // nếu
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]
            // nếu type là retweet thì content là '', nếu type là comment, quotetweet, tweet không có mentions và hashtags thì content phải là string và không được là string rỗng
            if (
              [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value.trim() === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }
            if (type === TweetType.Retweet && value.trim() !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là string
            if (value.some((item: string) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là new Object(user_id)
            if (value.some((item: string) => !ObjectId.isValid(item))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là media object
            if (
              value.some((item: Media) => {
                return typeof item.url !== 'string' || typeof !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.INVALID_TWEET_ID,
                status: StatusCodes.BAD_REQUEST
              })
            }

            // nếu dùng aggregate bên trong service thì sẽ gọi đến database 2 lần để query tweet
            // nên có thể dùng aggregate ở middleware và lấy về tweet luôn
            // const tweet = await databaseService.tweets.findOne({
            //   _id: new ObjectId(value)
            // })

            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
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
                }
              ])
              .toArray()
            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

// Muốn dùng async await trong handler express thì phải có try catch
// hoặc dùng wrapRequestHandler
export const audienceValidator = wrapRequestHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tweet = req.tweet as Tweet
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    if (tweet.audience === TweetAudience.TwitterCircle) {
      // vì là audience được add vào twitter circle nên phải check xem audience đã đăng nhập hay chưa
      if (!req.decoded_authorization) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
          status: StatusCodes.UNAUTHORIZED
        })
      }

      // kiểm tra tk của author đã bị banned hay bị xóa khỏi hệ thống chưa
      if (!author || author.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: StatusCodes.NOT_FOUND
        })
      }

      // kiểm tra tk audience có trong twittwe cirlce không
      const { user_id } = req.decoded_authorization as TokenPayload
      const isInTwitterCircle = author.twitter_circle.some((user_circle_id) =>
        user_circle_id.equals(user_id)
      )
      // nếu không phải là author và audience không thuộc trong twitter circle thì báo lỗi
      if (!isInTwitterCircle && !author._id.equals(user_id)) {
        throw new ErrorWithStatus({
          status: StatusCodes.FORBIDDEN,
          message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
        })
      }
    }
    ;(req as Request).author = author as User | undefined
    next()
  }
)

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: limitSchema,
      page: pageSchema
    },
    ['query']
  )
)
