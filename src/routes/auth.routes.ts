import { Hono } from 'hono'
import { container } from 'tsyringe'
import { AuthController } from '../app/controllers/auth.controller'
import { LoginUserDto } from '../app/dto/users/login.dto'
import { RefreshTokenDto } from '../app/dto/users/refresh-token.dto'
import { authMiddleware } from '../app/middlewares/auth.middleware'
import { validateDto } from '../app/middlewares/validate-dto.middleware'

const app = new Hono()

const authController = container.resolve(AuthController)

app.post('/login', validateDto(LoginUserDto), (c) => authController.login(c))
app.post('/refresh-token', validateDto(RefreshTokenDto), (c) => authController.refreshToken(c))
app.post('/logout', authMiddleware, (c) => authController.logout(c))

export default app
