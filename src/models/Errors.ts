import { StatusCodes } from 'http-status-codes'
import { USERS_MESSAGES } from '~/constants/messages'

type ErrorsType = {
  field: string
  message: string
  location: string
}

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType[]
  constructor({
    message = USERS_MESSAGES.VALIDATION_ERROR,
    errors
  }: {
    message?: string
    errors: ErrorsType[]
  }) {
    super({ message, status: StatusCodes.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
