import { ResourceEntity } from './resource.entity'

export interface UserEntity {
  id?: string
  name: string
  email: string
  password?: string

  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null

  token?: string | null
  refreshToken?: string | null

  resourceId?: string | null

  resource?: ResourceEntity | null
}
