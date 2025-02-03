import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.service'
import { validate } from '~/utils/validation'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'

export const loginValidator = (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Missing email or password' })
  } else {
    next()
  }
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const isExisting = await usersService.checkEmailExist(value)
          if (isExisting) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 100
        }
      },
      isStrongPassword: {
        errorMessage:
          'Password must be at least 6 characters long and contain at least 1 lowercase latter, 1 uppercase letter, 1 number, and 1 symbol',
        options: {
          minLength: 1,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      }
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 100
        }
      },
      isStrongPassword: {
        errorMessage:
          'Password must be at least 6 characters long and contain at least 1 lowercase latter, 1 uppercase letter, 1 number, and 1 symbol',
        options: {
          minLength: 1,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
