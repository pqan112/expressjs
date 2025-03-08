import { Collection, Db, MongoClient } from 'mongodb'
import { env } from '~/configs/environment'
import Follower from '~/models/schemas/Follower.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
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

  indexUsers() {
    this.users.createIndex({ email: 1, password: 1 })
    this.users.createIndex({ email: 1 }, { unique: true })
    this.users.createIndex({ username: 1 }, { unique: true })
  }

  indexRefreshTokens() {
    this.refreshTokens.createIndex({ token: 1 })
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  indexFollowers() {
    this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  get users(): Collection<User> {
    return this.db.collection(env.USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(env.REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(env.FOLLOWERS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
