import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title!: string

  @IsNotEmpty()
  @IsString()
  content!: string

  @IsOptional()
  @IsString({ each: true })
  resources?: string[]
}
