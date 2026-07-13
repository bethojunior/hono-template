import bcrypt from 'bcrypt'
import { createHash, timingSafeEqual } from 'crypto'
import { inject, injectable } from 'tsyringe'
import type { CreateUserDto } from '../dto/users/create-user.dto'
import { UserEntity } from '../entities/user.entity'
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors/http-error'
import { EventBusProvider } from '../providers/event-bus/event-bus.provider'
import { JwtProvider, type JwtPayload } from '../providers/jwt/jwt.provider'
import { PrismaProvider } from '../providers/prisma/prisma.provider'

const SALT_ROUNDS = 10

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function refreshTokenMatches(token: string, hashed: string): boolean {
  const candidate = Buffer.from(hashRefreshToken(token))
  const stored = Buffer.from(hashed)
  return candidate.length === stored.length && timingSafeEqual(candidate, stored)
}

@injectable()
export class UserService {
  constructor(
    @inject(PrismaProvider)
    private readonly prismaProvider: PrismaProvider,
    @inject(JwtProvider)
    private readonly jwtProvider: JwtProvider,
    @inject(EventBusProvider)
    private readonly eventBusProvider: EventBusProvider
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string
    refreshToken: string
    user: Omit<UserEntity, 'password' | 'refreshToken'>
  }> {
    try {
      const user = await this.prismaProvider.user.findUnique({
        where: { email },
      })

      if (!user) throw new NotFoundError('User not found')

      if (user.deletedAt) throw new UnauthorizedError('User account is deactivated')

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials')

      const accessToken = this.jwtProvider.sign({ sub: user.id, email: user.email })
      const refreshToken = this.jwtProvider.signRefreshToken({ sub: user.id, email: user.email })

      await this.prismaProvider.user.update({
        where: { id: user.id },
        data: { refreshToken: hashRefreshToken(refreshToken) },
      })

      const { password: _password, refreshToken: _refreshToken, ...userWithoutPassword } = user

      return { user: userWithoutPassword, accessToken, refreshToken }
    } catch (error) {
      throw error
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      let payload: JwtPayload
      try {
        payload = this.jwtProvider.verifyRefreshToken(refreshToken)
      } catch {
        throw new UnauthorizedError('Invalid or expired refresh token')
      }

      const user = await this.prismaProvider.user.findUnique({
        where: { id: payload.sub },
      })

      if (!user || user.deletedAt) throw new UnauthorizedError('Invalid or expired refresh token')

      if (!user.refreshToken) throw new UnauthorizedError('Invalid or expired refresh token')

      const isRefreshTokenValid = refreshTokenMatches(refreshToken, user.refreshToken)

      if (!isRefreshTokenValid) throw new UnauthorizedError('Invalid or expired refresh token')

      const accessToken = this.jwtProvider.sign({ sub: user.id, email: user.email })
      const newRefreshToken = this.jwtProvider.signRefreshToken({
        sub: user.id,
        email: user.email,
      })

      await this.prismaProvider.user.update({
        where: { id: user.id },
        data: { refreshToken: hashRefreshToken(newRefreshToken) },
      })

      return { accessToken, refreshToken: newRefreshToken }
    } catch (error) {
      throw error
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.prismaProvider.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      })
    } catch (error) {
      throw error
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      return await this.prismaProvider.user.findMany()
    } catch (error) {
      throw error
    }
  }

  async store(data: CreateUserDto): Promise<UserEntity> {
    try {
      const validateEmail = await this.prismaProvider.user.findUnique({
        where: { email: data.email },
      })

      if (validateEmail) {
        throw new ConflictError('Email already exists')
      }

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

      const exec = await this.prismaProvider.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          resourceId: data.resourceId || null,
        },
        include: {
          resource: true,
        },
      })
      const { password: _password, refreshToken: _refreshToken, ...userWithoutPassword } = exec

      try {
        await this.eventBusProvider.emit('user.created', {
          name: exec.name,
          email: exec.email,
        })
      } catch (error) {
        console.error('❌ Falha ao publicar evento user.created', error)
      }

      return userWithoutPassword
    } catch (error) {
      throw error
    }
  }
}
