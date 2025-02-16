import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.request'
import ResponseData from '~/models/ResponseData'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.service'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await usersService.login(user_id.toString())
  res
    .status(HTTP_STATUS.OK)
    .json(new ResponseData({ data: result, message: USERS_MESSAGES.LOGIN_SUCCESS, status: HTTP_STATUS.OK }))
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res
    .status(HTTP_STATUS.OK)
    .json(new ResponseData({ data: result, message: USERS_MESSAGES.REGISTER_SUCCESS, status: HTTP_STATUS.OK }))
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  res
    .status(HTTP_STATUS.OK)
    .json(new ResponseData({ data: null, message: USERS_MESSAGES.LOGOUT_SUCCESS, status: HTTP_STATUS.OK }))
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (user === null) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  // Đã verify rồi thì không báo lỗi
  // Trả về status OK với message là already verify before
  if (user.email_verify_token === '') {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  const result = await usersService.verifyEmail(user_id)
  res
    .status(HTTP_STATUS.OK)
    .json(new ResponseData({ data: result, message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS, status: HTTP_STATUS.OK }))
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (user === null) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  // Đã verify rồi thì không báo lỗi
  // Trả về status OK với message là already verify before
  if (user.verify === UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  await usersService.resendVerifyEmail(user_id)
  res
    .status(HTTP_STATUS.OK)
    .json(new ResponseData({ data: null, message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS, status: HTTP_STATUS.OK }))
}

// create forgot password token and update it to MongoDB
// send email
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id } = req.user as User
  await usersService.forgotPassword((_id as ObjectId).toString())
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ResponseData({ data: null, message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD, status: HTTP_STATUS.OK })
    )
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  const { _id } = req.user as User
  // Ở đây không gọi verifyForgotPassword vì khi gọi đến set lại forgot password token về empty string
  // nhưng nếu người dùng chỉ nhấn vào quên chưa đổi mật khẩu mới
  // có thể ngày hôm sau người dùng sẽ click vào link đổi verify-forgot-password ở email 1 lần nữa
  // thì lúc này verify-forgot-password-token đã bị xóa, check middleware đã không còn tồn tại verify-forgot-password-token
  // thì không hay -> nên không gọi verifyForgotPassword
  // await usersService.verifyForgotPassword((_id as ObjectId).toString())
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ResponseData({ data: null, message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS, status: HTTP_STATUS.OK })
    )
}
