import jwt, { type SignOptions } from 'jsonwebtoken'
import { injectable } from 'tsyringe'

export interface JwtPayload {
  sub: string
  email: string
}

@injectable()
export class JwtProvider {
  private readonly secret = process.env.JWT_SECRET
  private readonly expiresIn = (process.env.JWT_EXPIRATION_TIME ||
    '15m') as SignOptions['expiresIn']

  private readonly refreshSecret = process.env.REFRESH_TOKEN_SECRET
  private readonly refreshExpiresIn = (process.env.REFRESH_TOKEN_EXPIRATION_TIME ||
    '30d') as SignOptions['expiresIn']

  constructor() {
    if (!this.secret) {
      throw new Error('JWT_SECRET não está definido')
    }
    if (!this.refreshSecret) {
      throw new Error('REFRESH_TOKEN_SECRET não está definido')
    }
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret as string, { expiresIn: this.expiresIn })
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret as string) as JwtPayload
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret as string, { expiresIn: this.refreshExpiresIn })
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret as string) as JwtPayload
  }
}
