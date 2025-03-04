import { Router } from 'express'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controller'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.request'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * description: Log in
 * method: POST
 * body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * description: Log in with Google
 * method: GET
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

/**
 * description: Register a new user
 * method: POST
 * body: { name: string, email: string, password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * description: Log out
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * body: { email: string, password: string }
 */
// logout phải dùng method POST (để người dùng bấm nút logout)
// vì nếu dùng method GET người dùng enter url trên browser
// thì gọi đến API logout -> không hợp lý
usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
)

/**
 * description: Log out
 * method: POST
 * body: { refresh_token: string }
 */
usersRouter.post(
  '/refresh-token',
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
)

/**
 * description: Verify email
 * method: POST
 * body: { email_verify_token: string }
 */
usersRouter.post(
  '/verify-email',
  emailVerifyTokenValidator,
  wrapRequestHandler(verifyEmailController)
)

/**
 * description: Verify email when user click on the link in email
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * body: {}
 */
// Muốn verify email thì phải tạo account -> đăng nhập -> verify email
usersRouter.post(
  '/resend-verify-email',
  accessTokenValidator,
  wrapRequestHandler(resendVerifyEmailController)
)

/**
 * description: Submit email to reset password, send email to user
 * method: POST
 * body: { email: string }
 */
// Muốn verify email thì phải tạo account -> đăng nhập -> verify email
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
)

/**
 * description: Verify link in email to reset password
 * method: POST
 * body: { forgot_password_token: string }
 */
// Muốn verify email thì phải tạo account -> đăng nhập -> verify email
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * method: POST
 * body: { forgot-password-token: string, password: string, confirm_password: string }
 */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
)

/**
 * Description: Get my profile
 * method: GET
 * headers: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Update my profile
 * method: PATCH
 * headers: { Authorization: Bearer <access_token> }
 * body: Partial<UserSchema>
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get user profile
 * method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description: Follow someone
 * method: POST
 * headers: { Authorization: Bearer <access_token> }
 * body: { followed_user_id: string }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description: Unfollow someone
 * method: DELETE
 * headers: { Authorization: Bearer <access_token> }
 */
usersRouter.delete(
  '/unfollow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

/**
 * Description: Change password
 * method: PUT
 * headers: { Authorization: Bearer <access_token> }
 * body: { old_password: string, password: string, confirm_password: string }
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
