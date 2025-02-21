import { ObjectId } from 'mongodb'
import { env } from '~/configs/environment'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.request'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import databaseService from './database.service'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { StatusCodes } from 'http-status-codes'

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: env.JWT_SECRET_ACCESS_TOKEN as string,
      customOptions: {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: env.JWT_SECRET_REFRESH_TOKEN as string,
      customOptions: {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      customOptions: {
        expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signForgotPasswordToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      customOptions: {
        expiresIn: env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signAccessAndRefreshToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ])
  }

  async register(payload: RegisterReqBody) {
    // TODO: add send email to call email verify token later
    // nếu truyền user_id lên thì mongodb sẽ không tạo thêm _id nữa
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token: email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    console.log('email_verify_token', email_verify_token)

    return {
      access_token,
      refresh_token
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async verifyEmail(user_id: string) {
    // thời điểm tạo giá trị cập nhật updated_at: new Date()
    // thời điểm MongoDB cập nhật giá trị $currentDate -> sau thời điểm tạo giá trị cập nhật vài trăm ms

    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at: new Date()
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])

    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    console.log('email_verify_token', email_verify_token)

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    console.log('forgot_password_token', forgot_password_token)

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // TODO: send email with the link: https://abc.com/forgot-password?token=token
  }

  // async verifyForgotPassword(user_id: string) {
  //   await databaseService.users.updateOne(
  //     {
  //       _id: new ObjectId(user_id)
  //     },
  //     {
  //       $set: {
  //         forgot_password_token: ''
  //       },
  //       $currentDate: {
  //         updated_at: true
  //       }
  //     }
  //   )

  //   // TODO: send email with the link: https://abc.com/forgot-password?token=token
  // }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      // các trường không muốn trả về trong response
      {
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload

    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },

        $currentDate: {
          updated_at: true
        }
      },
      {
        // return updated data
        returnDocument: 'after',
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    )

    return user
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: StatusCodes.NOT_FOUND
      })
    }
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    const follow = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (follow === null) {
      return await databaseService.followers.insertOne({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    }
    return null
  }
}

const usersService = new UsersService()
export default usersService
