import { Hono } from 'hono'
import { container } from 'tsyringe'
import { EventsController } from '../app/controllers/event.controller'
import { authMiddleware } from '../app/middlewares/auth.middleware'

const app = new Hono()

const eventsController = container.resolve(EventsController)

app.use('*', authMiddleware)

app.get('/', (c) => eventsController.index(c))
app.post('/replay-failed', (c) => eventsController.replayFailed(c))
app.post('/:id/replay', (c) => eventsController.replay(c))

export default app
