import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/User.request'
import ResponseData from '~/models/ResponseData'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.service'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await usersService.login(user_id.toString())
  res
    .status(200)
    .json(new ResponseData({ data: result, message: USERS_MESSAGES.LOGIN_SUCCESS, status: HTTP_STATUS.OK }))
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res
    .status(200)
    .json(new ResponseData({ data: result, message: USERS_MESSAGES.REGISTER_SUCCESS, status: HTTP_STATUS.OK }))
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  res.status(200).json(new ResponseData({ data: null, message: USERS_MESSAGES.LOGOUT_SUCCESS, status: HTTP_STATUS.OK }))
}
