export const EVENTS_QUEUE = 'events'

export type EventMessage<T = unknown> = {
  eventId: string
  type: string
  payload: T
}
