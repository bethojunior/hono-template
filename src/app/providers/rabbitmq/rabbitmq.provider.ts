import amqp, { Channel, ChannelModel } from 'amqplib'
import { injectable } from 'tsyringe'

@injectable()
export class RabbitMqProvider {
  private connection: ChannelModel | null = null
  private channel: Channel | null = null

  async connect(): Promise<void> {
    if (this.channel) return

    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'

    this.connection = await amqp.connect(url)
    this.channel = await this.connection.createChannel()

    this.connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error', err)
    })

    this.connection.on('close', () => {
      console.warn('⚠️ RabbitMQ connection closed')
      this.channel = null
      this.connection = null
    })
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized. Call connect() first.')
    }

    return this.channel
  }

  async close(): Promise<void> {
    await this.channel?.close()
    await this.connection?.close()
    this.channel = null
    this.connection = null
  }
}
