import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
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
 * headers: { Authorization: Bearer <access_token> }
 * Body: { email: string, password: string }
 */
// logout phải dùng method POST (để người dùng bấm nút logout)
// vì nếu dùng method GET người dùng enter url trên browser
// thì gọi đến API logout -> không hợp lý
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Verify email
 * method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: Verify email when user click on the link in email
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * Body: {}
 */
// Muốn verify email thì phải tạo account -> đăng nhập -> verify email
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: Submit email to reset password, send email to user
 * method: POST
 * Body: { email: string }
 */
// Muốn verify email thì phải tạo account -> đăng nhập -> verify email
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * method: POST
 * Body: { forgot_password_token: string }
 */
// Muốn verify email thì phải tạo account -> đăng nhập -> verify email
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

export default usersRouter
