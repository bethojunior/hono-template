import { ResourceEntity } from './resource.entity'

export interface BlogResourceEntity {
  id: string
  blogId: string
  resourceId: string

  resource: ResourceEntity

  createdAt?: Date
  updatedAt?: Date
}
