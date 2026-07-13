import { injectable } from 'tsyringe'
import { UserCreatedPayload } from '../entities/user-created.entity'
import type { EventConsumer } from '../providers/event-bus/event-consumer.interface'
import type { EventMessage } from '../providers/event-bus/events'

@injectable()
export class UserCreatedConsumer implements EventConsumer<UserCreatedPayload> {
  readonly eventType = 'user.created'

  async handle(message: EventMessage<UserCreatedPayload>): Promise<void> {
    console.log('user created', message.payload)
  }
}
