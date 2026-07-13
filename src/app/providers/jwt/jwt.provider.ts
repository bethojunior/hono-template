import jwt, { type SignOptions } from 'jsonwebtoken'
import { injectable } from 'tsyringe'

export interface JwtPayload {
  sub: string
  email: string
}

@injectable()
export class JwtProvider {
  private readonly secret = process.env.JWT_SECRET as string
  private readonly expiresIn = (process.env.JWT_EXPIRATION_TIME ||
    '7d') as SignOptions['expiresIn']

  private readonly refreshSecret = process.env.REFRESH_TOKEN_SECRET as string
  private readonly refreshExpiresIn = (process.env.REFRESH_TOKEN_EXPIRATION_TIME ||
    '30d') as SignOptions['expiresIn']

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn })
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn })
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload
  }
}
