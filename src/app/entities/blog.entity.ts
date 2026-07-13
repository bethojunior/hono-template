export const BLOGS_CACHE_KEY = 'blogs:all'
export const blogCacheKey = (id: string) => `blogs:${id}`

export interface BlogEntity {
  id?: string
  title: string
  content: string

  createdAt?: Date
  updatedAt?: Date
}
