import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { writeFileSync, readFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

type StorageDriver = {
  upload(buffer: Buffer, key: string, contentType: string): Promise<string>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

class LocalStorage implements StorageDriver {
  private uploadDir: string

  constructor() {
    this.uploadDir = process.env.LOCAL_STORAGE_DIR || join(process.cwd(), 'uploads')
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async upload(buffer: Buffer, key: string): Promise<string> {
    const filePath = join(this.uploadDir, key)
    const dir = join(filePath, '..')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(filePath, buffer)
    return key
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.uploadDir, key)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    return `/api/files/${key}`
  }
}

class S3Storage implements StorageDriver {
  private client: S3Client
  private bucket: string

  constructor() {
    this.bucket = process.env.S3_BUCKET!
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
  }

  async upload(buffer: Buffer, key: string, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))
    return key
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    return getSignedUrl(this.client, command, { expiresIn })
  }
}

function createStorage(): StorageDriver {
  const provider = process.env.STORAGE_PROVIDER || 'local'
  
  if (provider === 'local') {
    return new LocalStorage()
  }
  
  if (provider === 's3' || provider === 'b2') {
    const required = ['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`${key} not configured`)
      }
    }
    return new S3Storage()
  }
  
  throw new Error(`Unknown storage provider: ${provider}`)
}

export const storage = createStorage()

export function generateFileKey(bookId: string, versionId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `books/${bookId}/versions/${versionId}/${safeName}`
}

export function generateCoverKey(bookId: string, ext: string): string {
  return `books/${bookId}/cover.${ext}`
}
