import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    const errorsObject = errors.mapped()

    if (errors.isEmpty()) {
      next()
      return
    }
    const entityError = new EntityError({ errors: [] })
    for (const key in errorsObject) {
      const { msg, path, location } = errorsObject[key] as any
      // {
      //   message: 'Validation error messgae',
      //   status: 422,
      //   errors: [
      //     {
      //       field: 'x',
      //       message: 'x',
      //       location: 'x'
      //     }
      //   ]
      // }

      // {
      //   message: 'Error message',
      //   status: 4xx,
      // }
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }

      entityError.errors.push({
        field: path,
        message: msg,
        location: location
      })
    }
    return next(entityError)
  }
}
