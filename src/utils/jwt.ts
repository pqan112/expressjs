import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = '',
  options = {
    algorithm: 'HS256'
  },
  customOptions
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: jwt.SignOptions
  customOptions: Omit<jwt.SignOptions, 'algorithm'>
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
