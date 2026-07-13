import { Hono } from 'hono'
import { container } from 'tsyringe'
import { BlogController } from '../app/controllers/blog.controller'
import { CreateBlogDto } from '../app/dto/blog/create-blog.dto'
import { UpdateBlogDto } from '../app/dto/blog/update-blog.dto'
import { authMiddleware } from '../app/middlewares/auth.middleware'
import { validateDto } from '../app/middlewares/validate-dto.middleware'

const app = new Hono()

const blogController = container.resolve(BlogController)

app.use('*', authMiddleware)

app.get('/', (c) => blogController.index(c))
app.post('/', validateDto(CreateBlogDto), (c) => blogController.store(c))
app.get('/:id', (c) => blogController.show(c))
app.patch('/:id', validateDto(UpdateBlogDto), (c) => blogController.update(c))
app.delete('/:id', (c) => blogController.destroy(c))

export default app
