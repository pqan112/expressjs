import { Router } from 'express'
import { loginController } from '~/controllers/users.controller'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

usersRouter.post(
  '/login',
  // (req, res, next) => {
  //   console.log('req', req.method, req)
  //   next()
  // },
  loginValidator,
  loginController
)

export default usersRouter
