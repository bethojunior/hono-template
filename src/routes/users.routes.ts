import { Hono } from 'hono'
import { container } from 'tsyringe'
import { UsersController } from '../app/controllers/user.controller'
import { CreateUserDto } from '../app/dto/users/create-user.dto'
import { authMiddleware } from '../app/middlewares/auth.middleware'
import { validateDto } from '../app/middlewares/validate-dto.middleware'

const app = new Hono()

const usersController = container.resolve(UsersController)

app.get('/', authMiddleware, (c) => usersController.findAll(c))
app.post('/', validateDto(CreateUserDto), (c) => usersController.store(c))

export default app
