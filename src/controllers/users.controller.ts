import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { env } from '~/configs/environment'
import { UserVerifyStatus } from '~/constants/enum'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import ResponseData from '~/models/ResponseData'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.service'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
) => {
  const user = req.user as User

  const result = await usersService.login({
    user_id: (user._id as ObjectId).toString(),
    verify: user.verify
  })
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query

  const result = await usersService.oauth(code as string)
  const urlRedirect = `${env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  // send new_user to client
  // if new_user=0, register successfully
  // if new_user=1, login successfully
  res.redirect(urlRedirect)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  const result = await usersService.register(req.body)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.LOGOUT_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenBody>,
  res: Response
) => {
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  const result = await usersService.refreshToken({ user_id, refresh_token, verify, exp })

  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  // Đã verify rồi thì không báo lỗi
  // Trả về status OK với message là already verify before
  if (user.email_verify_token === '') {
    res.status(StatusCodes.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  const result = await usersService.verifyEmail(user_id)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  // Đã verify rồi thì không báo lỗi
  // Trả về status OK với message là already verify before
  if (user.verify === UserVerifyStatus.Verified) {
    res.status(StatusCodes.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  await usersService.resendVerifyEmail(user_id)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

// create forgot password token and update it to MongoDB
// send email
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const user = req.user as User
  await usersService.forgotPassword({
    user_id: (user._id as ObjectId).toString(),
    verify: user.verify
  })
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
      status: StatusCodes.OK
    })
  )
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  // Ở đây không gọi verifyForgotPassword trong usersService vì khi gọi đến set lại forgot password token về empty string
  // nhưng nếu người dùng chỉ nhấn vào quên chưa đổi mật khẩu mới
  // có thể ngày hôm sau người dùng sẽ click vào link đổi verify-forgot-password ở email 1 lần nữa
  // thì lúc này forgot_password_token đã bị xóa, check middleware đã không còn tồn tại forgot_password_token
  // thì không hay -> nên không gọi verifyForgotPassword
  // xóa forgot_password_token sau khi resetPassword
  // const { _id } = req.user as User
  // await usersService.verifyForgotPassword((_id as ObjectId).toString())
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body

  await usersService.resetPassword(user_id, password)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMe(user_id)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.GET_ME_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.updateMe(user_id, req.body)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params

  const result = await usersService.getProfile(username)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: result,
      message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body

  const result = await usersService.follow(user_id, followed_user_id)
  if (!result) {
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: result,
        message: USERS_MESSAGES.FOLLOWED,
        status: StatusCodes.OK
      })
    )
    return
  }
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.FOLLOW_SUCCESS,
      status: StatusCodes.OK
    })
  )
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params

  const result = await usersService.unfollow(user_id, followed_user_id)
  if (result) {
    res.status(StatusCodes.OK).json(
      new ResponseData({
        data: null,
        message: USERS_MESSAGES.UNFOLLOW_SUCCESS,
        status: StatusCodes.OK
      })
    )
    return
  }
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
      status: StatusCodes.OK
    })
  )
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body

  await usersService.changePassword(user_id, password)
  res.status(StatusCodes.OK).json(
    new ResponseData({
      data: null,
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS,
      status: StatusCodes.OK
    })
  )
}
