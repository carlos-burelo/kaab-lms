import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, normalize, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

type FileMetadata = {
  mimeType: string
  sizeInBytes: number
  width?: number
  height?: number
  durationInSeconds?: number
  createdAt: Date
  updatedAt: Date
  hash?: string
}

type SaveFileOptions = {
  folder?: string
  generateHash?: boolean
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/avi',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.csv': 'text/csv'
}

export class StorageService {
  private readonly storageDir: string

  constructor(customDir?: string) {
    if (customDir) {
      this.storageDir = normalize(customDir)
    } else {
      const __dirname = dirname(fileURLToPath(import.meta.url))
      this.storageDir = normalize(join(__dirname, '../../storage'))
    }
  }

  async initialize(): Promise<void> {
    if (!existsSync(this.storageDir)) {
      await mkdir(this.storageDir, { recursive: true })
    }
  }

  async saveFile(fileName: string, data: Blob | Buffer | ArrayBuffer, options: SaveFileOptions = {}): Promise<string> {
    const { folder, generateHash = false } = options
    const safeName = this.sanitizeFileName(fileName)
    const targetDir = folder ? join(this.storageDir, folder) : this.storageDir

    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    const filePath = join(targetDir, safeName)

    if (!this.isPathSafe(filePath)) {
      throw new Error('Invalid file path')
    }

    let buffer: Buffer
    if (data instanceof Blob) {
      buffer = Buffer.from(await data.arrayBuffer())
    } else if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data)
    } else {
      buffer = data
    }

    await writeFile(filePath, buffer)

    if (generateHash) {
      await this.generateHash(filePath)
    }

    return filePath
  }

  async readFile(filePath: string): Promise<Buffer> {
    if (!this.isPathSafe(filePath) || !existsSync(filePath)) {
      throw new Error('File not found')
    }
    return await readFile(filePath)
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.isPathSafe(filePath) || !existsSync(filePath)) {
      throw new Error('File not found')
    }
    await unlink(filePath)
  }

  async deleteFolder(folder: string): Promise<void> {
    const fullPath = join(this.storageDir, folder)
    if (!this.isPathSafe(fullPath)) {
      throw new Error('Invalid folder path')
    }
    await rm(fullPath, { recursive: true, force: true })
  }

  async moveFile(sourcePath: string, destFolder: string, newName?: string): Promise<string> {
    if (!this.isPathSafe(sourcePath)) {
      throw new Error('Invalid source path')
    }

    const buffer = await this.readFile(sourcePath)
    const fileName = newName || basename(sourcePath)
    const destPath = await this.saveFile(fileName, buffer, { folder: destFolder })
    await this.deleteFile(sourcePath)

    return destPath
  }

  async getMetadata(filePath: string): Promise<FileMetadata> {
    if (!this.isPathSafe(filePath) || !existsSync(filePath)) {
      throw new Error('File not found')
    }

    const stats = await stat(filePath)
    const ext = extname(filePath).toLowerCase()

    const metadata: FileMetadata = {
      mimeType: MIME_TYPES[ext] || 'application/octet-stream',
      sizeInBytes: stats.size,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime
    }

    if (this.isImage(metadata.mimeType)) {
      const imageMeta = await this.getImageDimensions(filePath)
      if (imageMeta) {
        metadata.width = imageMeta.width
        metadata.height = imageMeta.height
      }
    }

    if (this.isVideo(metadata.mimeType)) {
      const duration = await this.getVideoDuration(filePath)
      if (duration) {
        metadata.durationInSeconds = duration
      }
    }

    return metadata
  }

  async listFiles(folder?: string): Promise<string[]> {
    const targetDir = folder ? join(this.storageDir, folder) : this.storageDir
    if (!this.isPathSafe(targetDir)) {
      throw new Error('Invalid folder path')
    }
    return await readdir(targetDir)
  }

  async generateHash(filePath: string): Promise<string> {
    const buffer = await readFile(filePath)
    return createHash('sha256').update(buffer).digest('hex')
  }

  fileExists(filePath: string): boolean {
    return this.isPathSafe(filePath) && existsSync(filePath)
  }

  getPublicUrl(filePath: string, baseUrl: string): string {
    const relativePath = relative(this.storageDir, filePath).split('\\').join('/')
    return `${baseUrl}/storage/${relativePath}`
  }

  getStorageDir(): string {
    return this.storageDir
  }

  private sanitizeFileName(fileName: string): string {
    const ext = extname(fileName).toLowerCase()
    const name = basename(fileName, ext)
    const sanitized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100)
    const timestamp = Date.now()
    return `${sanitized}-${timestamp}${ext}`
  }

  private isPathSafe(filePath: string): boolean {
    const normalizedPath = normalize(filePath)
    const relativePath = relative(this.storageDir, normalizedPath)
    return !relativePath.startsWith('..') && !relativePath.startsWith('\\') && normalizedPath.startsWith(this.storageDir)
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  private isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/')
  }

  private async getImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
    try {
      const sharp = await import('sharp')
      const metadata = await sharp.default(filePath).metadata()
      return { width: metadata.width || 0, height: metadata.height || 0 }
    } catch {
      return null
    }
  }

  private async getVideoDuration(filePath: string): Promise<number | null> {
    try {
      const musicMetadata = await import('music-metadata')
      const metadata = await musicMetadata.parseFile(filePath)
      return metadata.format.duration ? Math.floor(metadata.format.duration) : null
    } catch {
      return null
    }
  }
}
