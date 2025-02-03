import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import usersService from '~/services/users.service'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'pqan112@gmail.com' && password === 'pqanne') {
    res.status(200).json({ message: 'Login successfully' })
  } else {
    res.status(400).json({ message: 'Login failed' })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({ message: 'Register successfully', result })
}
