// src/app/dtos/create-user.dto.ts

import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string

  @MinLength(6)
  password!: string

  @IsOptional()
  resourceId?: string
}
