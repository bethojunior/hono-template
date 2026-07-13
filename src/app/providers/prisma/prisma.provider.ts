// src/providers/prisma.provider.ts

import { PrismaClient } from '@prisma/client'
import { injectable } from 'tsyringe'

@injectable()
export class PrismaProvider extends PrismaClient {
  constructor() {
    super()
  }
}
