import { env } from '@config'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'

export function signJwt(obj: object): string {
  return jwt.sign(
    obj,
    env.JWT_SECRET_KEY as Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN
    } as SignOptions
  )
}

export function verifyJwt<T extends object>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET_KEY) as T
}
