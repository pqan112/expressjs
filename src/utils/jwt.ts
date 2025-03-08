import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.request'

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  },
  customOptions
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
  customOptions?: Omit<jwt.SignOptions, 'algorithm'>
}) => {
  const newOptions = { ...options, ...customOptions }
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, newOptions, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey
}: {
  token: string
  secretOrPublicKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
