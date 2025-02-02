import 'dotenv/config'

export const env = {
  PORT: process.env.PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  USERS_COLLECTION: process.env.USERS_COLLECTION
}
