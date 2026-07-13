import {
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3'
import { injectable } from 'tsyringe'

@injectable()
export class S3Provider {
  private readonly s3: S3Client
  private readonly bucket = process.env.S3_BUCKET_NAME as string
  private readonly ready: Promise<void>

  constructor() {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    })

    this.ready = this.ensureBucket()
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }))
    }

    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetBucketLocation', 's3:ListBucket', 's3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}`, `arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      })
    )
  }

  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<void> {
    await this.ready

    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }

    await this.s3.send(new PutObjectCommand(uploadParams))
  }

  async deleteFile(key: string): Promise<void> {
    await this.ready

    const deleteParams: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
    }

    await this.s3.send(new DeleteObjectCommand(deleteParams))
  }

  async deleteMultipleFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(key)))
  }
}
