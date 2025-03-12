import { ObjectId } from 'mongodb'

type LikeConstructorType = {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_date?: Date
}

export default class Like {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_date: Date

  constructor({ _id, user_id, tweet_id, created_date }: LikeConstructorType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.created_date = created_date || new Date()
  }
}
