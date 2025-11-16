import { z } from 'zod'

/**
 * Validadores seguros para cada tipo de contenido
 */

// Text Content
export const TextContentSchema = z.object({
  title: z.string().max(255).optional().or(z.literal('')),
  content: z.string().max(50000)
})

export type TextContent = z.infer<typeof TextContentSchema>

// Video Content
export const VideoContentSchema = z.object({
  url: z
    .string()
    .refine(
      (url) =>
        !url ||
        url.startsWith('/') ||
        (() => {
          try {
            new URL(url)
            return true
          } catch {
            return false
          }
        })(),
      { message: 'La URL debe ser una URL válida o una ruta relativa (ej: /uploads/video.mp4)' }
    )
    .default(''),
  embed: z.string().max(10000).default(''),
  type: z.enum(['url', 'embed']).default('url')
})

export type VideoContent = z.infer<typeof VideoContentSchema>

// Image Content
export const ImageContentSchema = z.object({
  url: z.string().refine(
    (url) =>
      url.startsWith('/') ||
      (() => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })(),
    { message: 'La URL debe ser una URL válida o una ruta relativa (ej: /uploads/imagen.jpg)' }
  ),
  alt: z.string().max(255).default('')
})

export type ImageContent = z.infer<typeof ImageContentSchema>

// Code Content
export const CodeLanguages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'sql',
  'html',
  'css',
  'bash',
  'json',
  'xml'
] as const

export const CodeContentSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.enum(CodeLanguages)
})

export type CodeContent = z.infer<typeof CodeContentSchema>

// Document/Audio Content
export const DocumentContentSchema = z.object({
  url: z.string().refine(
    (url) =>
      url.startsWith('/') ||
      (() => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })(),
    { message: 'La URL debe ser una URL válida o una ruta relativa (ej: /uploads/archivo.pdf)' }
  ),
  name: z.string().max(255),
  size: z.number().min(0)
})

export type DocumentContent = z.infer<typeof DocumentContentSchema>

// Link Content
export const LinkContentSchema = z.object({
  url: z.string().url(),
  description: z.string().max(1000).default('')
})

export type LinkContent = z.infer<typeof LinkContentSchema>

/**
 * Parser seguro para contenido JSON almacenado
 */
export function parseTextContent(contenido: string | null): TextContent {
  if (!contenido) {
    return { title: '', content: '' }
  }

  try {
    const parsed = JSON.parse(contenido)
    const validated = TextContentSchema.parse(parsed)
    return validated
  } catch {
    // Si falla el parseo JSON, asumir que es contenido HTML puro
    return {
      title: '',
      content: contenido.substring(0, 50000)
    }
  }
}

export function parseVideoContent(contenido: string | null): VideoContent {
  if (!contenido) {
    return { url: '', embed: '', type: 'url' }
  }

  try {
    const parsed = JSON.parse(contenido)
    return VideoContentSchema.parse(parsed)
  } catch {
    // Si falla, asumir que es una URL simple
    try {
      new URL(contenido)
      return { url: contenido, embed: '', type: 'url' }
    } catch {
      return { url: '', embed: '', type: 'url' }
    }
  }
}

export function parseImageContent(contenido: string | null): ImageContent {
  if (!contenido) {
    return { url: '', alt: '' }
  }

  try {
    const parsed = JSON.parse(contenido)
    return ImageContentSchema.parse(parsed)
  } catch {
    // Si falla, asumir que es una URL simple
    try {
      new URL(contenido)
      return { url: contenido, alt: '' }
    } catch {
      return { url: '', alt: '' }
    }
  }
}

export function parseCodeContent(contenido: string | null): CodeContent {
  if (!contenido) {
    return { code: '', language: 'javascript' }
  }

  try {
    const parsed = JSON.parse(contenido)
    return CodeContentSchema.parse(parsed)
  } catch {
    // Si falla, asumir que es código simple con lenguaje por defecto
    return {
      code: contenido.substring(0, 50000),
      language: 'javascript'
    }
  }
}

export function parseDocumentContent(contenido: string | null): DocumentContent {
  if (!contenido) {
    return { url: '', name: '', size: 0 }
  }

  try {
    const parsed = JSON.parse(contenido)
    return DocumentContentSchema.parse(parsed)
  } catch {
    // Si falla, asumir que es una URL simple
    try {
      new URL(contenido)
      return { url: contenido, name: 'Documento', size: 0 }
    } catch {
      return { url: '', name: '', size: 0 }
    }
  }
}

export function parseLinkContent(contenido: string | null): LinkContent {
  if (!contenido) {
    return { url: '', description: '' }
  }

  try {
    const parsed = JSON.parse(contenido)
    return LinkContentSchema.parse(parsed)
  } catch {
    // Si falla, asumir que es una URL simple
    try {
      new URL(contenido)
      return { url: contenido, description: '' }
    } catch {
      return { url: '', description: '' }
    }
  }
}

/**
 * Validar y serializar contenido para guardar
 */
export function serializeContent(
  content: TextContent | VideoContent | ImageContent | CodeContent | DocumentContent | LinkContent,
  schema: z.ZodSchema
): string {
  const validated = schema.parse(content)
  return JSON.stringify(validated)
}
