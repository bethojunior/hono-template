import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { BlogCreatedConsumer } from './app/consumers/blog-created.consumer'
import { UserCreatedConsumer } from './app/consumers/user-created.consumer'
import { EventBusConsumer } from './app/providers/event-bus/event-bus.consumer'
import { EventBusProvider } from './app/providers/event-bus/event-bus.provider'
import authRoutes from './routes/auth.routes'
import blogRoutes from './routes/blog.routes'
import resourceRoutes from './routes/resource.routes'
import usersRoutes from './routes/users.routes'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRoutes)
app.route('/user', usersRoutes)
app.route('/resource', resourceRoutes)
app.route('/blog', blogRoutes)

async function bootstrapEventBus(): Promise<void> {
  const eventBusProvider = container.resolve(EventBusProvider)
  await eventBusProvider.connect()

  const eventBusConsumer = container.resolve(EventBusConsumer)
  eventBusConsumer.register(container.resolve(BlogCreatedConsumer))
  eventBusConsumer.register(container.resolve(UserCreatedConsumer))
  await eventBusConsumer.start()
}

bootstrapEventBus().catch((error) => {
  console.error('❌ Falha ao iniciar o EventBus', error)
})

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
