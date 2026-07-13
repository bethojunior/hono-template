import { Hono } from 'hono'
import { container } from 'tsyringe'
import { ResourceController } from '../app/controllers/resource.controller'
import { authMiddleware } from '../app/middlewares/auth.middleware'

const app = new Hono()

const resourceController = container.resolve(ResourceController)

app.use('*', authMiddleware)

app.post('/', (c) => resourceController.store(c))
app.get('/:id', (c) => resourceController.show(c))
app.delete('/:id', (c) => resourceController.destroy(c))

export default app
