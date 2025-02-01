import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email === 'pqan112@gmail.com' && password === 'pqanne') {
    res.status(200).json({ message: 'Login successfully' })
    return
  }
  res.status(400).json({ message: 'Login failed' })
}
