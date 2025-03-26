import { config } from 'dotenv'
import argv from 'minimist'
import { ENVIRONMENTS } from '~/constants/envs'
const options = argv(process.argv.slice(2))
export const isProduction = options.env === ENVIRONMENTS.PRODUCTION

config({
  path: options.env ? `.env.${options.env}` : '.env'
})

export const env = {
  HOST: process.env.HOST as string,
  PORT: process.env.PORT as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,

  USERS_COLLECTION: process.env.USERS_COLLECTION as string,
  REFRESH_TOKENS_COLLECTION: process.env.REFRESH_TOKENS_COLLECTION as string,
  FOLLOWERS_COLLECTION: process.env.FOLLOWERS_COLLECTION as string,
  TWEETS_COLLECTION: process.env.TWEETS_COLLECTION as string,
  HASHTAGS_COLLECTION: process.env.HASHTAGS_COLLECTION as string,
  BOOKMARKS_COLLECTION: process.env.BOOKMARKS_COLLECTION as string,
  LIKES_COLLECTION: process.env.LIKES_COLLECTION as string,
  PASSWORD_SECRET_KEY: process.env.PASSWORD_SECRET_KEY as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_AUTHORIZED_REDIRECT_URI: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI as string,
  CLIENT_REDIRECT_CALLBACK: process.env.CLIENT_REDIRECT_CALLBACK as string,
  CLIENT_URL: process.env.CLIENT_REDIRECT_CALLBACK as string
}
