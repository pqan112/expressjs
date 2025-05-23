import { Collection, Db, MongoClient } from 'mongodb'
import { env } from '~/configs/environment'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Follower from '~/models/schemas/Follower.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Like from '~/models/schemas/Like.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import User from '~/models/schemas/User.schema'
const uri = `mongodb+srv://${env.DB_USERNAME}:${env.DB_PASSWORD}@cluster0.zb3wp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true
//   }
// })

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async closeDB() {
    await this.client.close()
  }

  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const exists = await this.users.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexFollowers() {
    const exists = await this.users.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(env.USERS_COLLECTION)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(env.REFRESH_TOKENS_COLLECTION)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(env.FOLLOWERS_COLLECTION)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(env.TWEETS_COLLECTION)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(env.HASHTAGS_COLLECTION)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(env.BOOKMARKS_COLLECTION)
  }

  get likes(): Collection<Like> {
    return this.db.collection(env.LIKES_COLLECTION)
  }
}

const databaseService = new DatabaseService()
export default databaseService
