import { inject, injectable } from 'tsyringe'
import { ResourceEntity } from '../entities/resource.entity'
import { PrismaProvider } from '../providers/prisma/prisma.provider'
import { S3Provider } from '../providers/s3/s3.provider'

@injectable()
export class ResourceService {
  constructor(
    @inject(PrismaProvider)
    private readonly prismaProvider: PrismaProvider,
    @inject(S3Provider)
    private readonly s3Provider: S3Provider
  ) {}

  async store(file: File, flow?: string): Promise<ResourceEntity> {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const key = flow ? `${flow}/${fileName}` : `default/${fileName}`

      const buffer = Buffer.from(await file.arrayBuffer())
      await this.s3Provider.uploadBuffer(buffer, key, file.type)

      const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`

      return await this.prismaProvider.resource.create({
        data: { url: fileUrl },
      })
    } catch (error) {
      throw new Error(`Error storing resource: ${error}`)
    }
  }

  async findOne(id: string): Promise<ResourceEntity | null> {
    try {
      return await this.prismaProvider.resource.findUnique({ where: { id } })
    } catch (error) {
      throw new Error(`Error fetching resource: ${error}`)
    }
  }

  async delete(id: string): Promise<ResourceEntity> {
    try {
      const resource = await this.prismaProvider.resource.findUnique({ where: { id } })

      if (!resource || !resource.url) {
        throw new Error('Resource not found')
      }

      const key = resource.url.split(`/${process.env.S3_BUCKET_NAME}/`)[1]
      await this.s3Provider.deleteFile(key)

      return await this.prismaProvider.resource.delete({ where: { id } })
    } catch (error) {
      throw new Error(`Error deleting resource: ${error}`)
    }
  }
}
