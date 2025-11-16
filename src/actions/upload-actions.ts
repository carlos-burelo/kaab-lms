'use server'

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 50 * 1024 * 1024

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
}

const ensureUploadDir = async () => {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100)
}

const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const sanitized = sanitizeFilename(originalName)
  return `${timestamp}-${random}-${sanitized}`
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: 'No se proporcionó ningún archivo' }
    }

    if (!ALLOWED_TYPES.image.includes(file.type)) {
      return { success: false, error: 'Tipo de archivo no válido para imágenes' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'El archivo es demasiado grande (máx. 50MB)' }
    }

    await ensureUploadDir()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueFilename = generateUniqueFilename(file.name)
    const uploadPath = join(UPLOAD_DIR, uniqueFilename)

    await writeFile(uploadPath, buffer)

    return {
      success: true,
      url: `/uploads/${uniqueFilename}`
    }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return { success: false, error: 'Error al procesar la imagen' }
  }
}

export async function uploadVideo(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: 'No se proporcionó ningún archivo' }
    }

    if (!ALLOWED_TYPES.video.includes(file.type)) {
      return { success: false, error: 'Tipo de archivo no válido para videos' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'El archivo es demasiado grande (máx. 50MB)' }
    }

    await ensureUploadDir()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueFilename = generateUniqueFilename(file.name)
    const uploadPath = join(UPLOAD_DIR, uniqueFilename)

    await writeFile(uploadPath, buffer)

    return {
      success: true,
      url: `/uploads/${uniqueFilename}`
    }
  } catch (error) {
    console.error('Error al subir video:', error)
    return { success: false, error: 'Error al procesar el video' }
  }
}

export async function uploadFile(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: 'No se proporcionó ningún archivo' }
    }

    const allAllowedTypes = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.video, ...ALLOWED_TYPES.document]

    if (!allAllowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipo de archivo no válido' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'El archivo es demasiado grande (máx. 50MB)' }
    }

    await ensureUploadDir()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueFilename = generateUniqueFilename(file.name)
    const uploadPath = join(UPLOAD_DIR, uniqueFilename)

    await writeFile(uploadPath, buffer)

    return {
      success: true,
      url: `/uploads/${uniqueFilename}`
    }
  } catch (error) {
    console.error('Error al subir archivo:', error)
    return { success: false, error: 'Error al procesar el archivo' }
  }
}
