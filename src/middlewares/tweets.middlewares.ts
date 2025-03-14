import { checkSchema } from 'express-validator'
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

const tweetTypes = numberEnumToArray(TweetType)
const audienceTypes = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)
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
            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value)
            })
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
    if (tweet.audience === TweetAudience.TwitterCircle) {
      // vì là audience được add vào twitter circle nên phải check xem audience đã đăng nhập hay chưa
      if (!req.decoded_authorization) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
          status: StatusCodes.UNAUTHORIZED
        })
      }

      // kiểm tra tk của author đã bị banned hay bị xóa khỏi hệ thống chưa
      const author = await databaseService.users.findOne({
        _id: new ObjectId(tweet.user_id)
      })

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
    next()
  }
)
