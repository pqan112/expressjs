import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.service'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await usersService.login(user_id.toString())
  res.status(200).json({ message: USERS_MESSAGES.LOGIN_SUCCESS, status: 200, data: result })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.status(200).json({ message: USERS_MESSAGES.REGISTER_SUCCESS, status: 200, result })
}
