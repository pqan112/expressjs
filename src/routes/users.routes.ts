import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Description: Log in
 * method: POST
 * Body: {  email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * Description: Register a new user
 * method: POST
 * Body: { name: string, email: string, password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Log out
 * method: POST
 * Body: {  email: string, password: string }
 */
// logout phải dùng method POST (để người dùng bấm nút logout)
// vì nếu dùng method GET người dùng enter url trên browser
// thì gọi đến API logout -> không hợp lý

export default usersRouter
