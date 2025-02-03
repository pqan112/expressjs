import { Request, Response } from 'express'
import usersService from '~/services/users.service'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'pqan112@gmail.com' && password === 'pqanne') {
    res.status(200).json({ message: 'Login successfully' })
  } else {
    res.status(400).json({ message: 'Login failed' })
  }
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
    res.json({ message: 'Register successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Register failed' })
  }
}
