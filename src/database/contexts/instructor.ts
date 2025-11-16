import crypto from 'node:crypto'
import path from 'node:path'
import Docxtemplater from 'docxtemplater'
import { revalidatePath } from 'next/cache'
import PizZip from 'pizzip'
import { prisma } from '@/database/client'
import { instructorRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import { convertDocxToPdf } from '@/lib/docx-to-pdf'
import { StorageService } from '@/services/storage'

export async function getMyCourses() {
  const session = await getSession()
  if (!session?.id) throw new Error('No authenticated user found')
  return await instructorRepository.getMyCourses(session.id)
}

export async function getMyStudents() {
  const session = await getSession()
  if (!session?.id) throw new Error('No authenticated user found')
  return await instructorRepository.getMyStudents(session.id)
}

// 'use server'

const storage = new StorageService(path.join(process.cwd(), 'storage'))

export async function getMyCertificateTemplates() {
  const templates = await prisma.certificateTemplate.findMany({
    include: {
      file: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return templates
}

export async function getMyCertificateTemplateById(templateId: string) {
  const template = await prisma.certificateTemplate.findUnique({
    where: { id: templateId },
    include: {
      file: true
    }
  })
  return template
}

export async function crearPlantilla(formData: FormData) {
  try {
    const nombre = formData.get('nombre') as string
    const descripcion = formData.get('descripcion') as string
    const archivo = formData.get('archivo') as File
    const variablesJson = formData.get('variables') as string
    const variables = JSON.parse(variablesJson)

    if (!nombre || !archivo) {
      return { success: false, error: 'Faltan campos requeridos' }
    }

    await storage.initialize()

    const arrayBuffer = await archivo.arrayBuffer()
    const filePath = await storage.saveFile(archivo.name, arrayBuffer, {
      folder: 'templates'
    })

    const archivoRecord = await prisma.file.create({
      data: {
        name: path.basename(filePath),
        url: storage.getPublicUrl(filePath, process.env.NEXT_PUBLIC_APP_URL || ''),
        type: archivo.type,
        sizeInBytes: BigInt(archivo.size),
        mimeType: archivo.type,
        originalName: archivo.name,
        path: filePath
      }
    })

    await prisma.certificateTemplate.create({
      data: {
        name: nombre,
        description: descripcion || null,
        fileId: archivoRecord.id,
        variables,
        isActive: true
      }
    })

    revalidatePath('/plantillas')
    return { success: true }
  } catch (_error) {
    return { success: false, error: 'Error al crear la plantilla' }
  }
}

export async function togglePlantillaEstado(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const plantilla = await prisma.certificateTemplate.findUnique({
      where: { id }
    })

    if (!plantilla) {
      return { success: false, error: 'Plantilla no encontrada' }
    }

    await prisma.certificateTemplate.update({
      where: { id },
      data: {
        isActive: !plantilla.isActive
      }
    })

    revalidatePath('/plantillas')
    return { success: true }
  } catch (_error) {
    return { success: false, error: 'Error al cambiar estado' }
  }
}

export async function eliminarPlantilla(formData: FormData) {
  try {
    const id = formData.get('id') as string

    const plantilla = await prisma.certificateTemplate.findUnique({
      where: { id },
      include: { file: true }
    })

    if (!plantilla) {
      return { success: false, error: 'Plantilla no encontrada' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.certificate.deleteMany({
        where: { templateId: id }
      })

      await tx.certificateTemplate.delete({
        where: { id }
      })

      await tx.file.delete({
        where: { id: plantilla.fileId }
      })
    })

    try {
      if (plantilla.file?.path && storage.fileExists(plantilla.file.path)) {
        await storage.deleteFile(plantilla.file.path)
      }
    } catch (_fileError) {}

    revalidatePath('/plantillas')
    return { success: true }
  } catch (_error) {
    return { success: false, error: 'Error al eliminar plantilla' }
  }
}

export async function generarCertificado(
  formData: FormData
): Promise<{ success: boolean; pdfUrl?: string; error?: string; certificadoId?: string }> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'Usuario no autenticado' }
    }
    const usuarioId = session.id

    const plantillaId = formData.get('plantillaId') as string
    const cursoId = formData.get('cursoId') as string

    if (!plantillaId || !cursoId) {
      return {
        success: false,
        error: 'Faltan plantillaId o cursoId en el formulario'
      }
    }

    const plantilla = await prisma.certificateTemplate.findUnique({
      where: { id: plantillaId },
      include: { file: true }
    })

    if (!plantilla || !plantilla.file) {
      return { success: false, error: 'Plantilla o archivo no encontrado' }
    }

    const datosPersonalizados: Record<string, string> = {}
    if (Array.isArray(plantilla.variables)) {
      for (const variable of plantilla.variables as string[]) {
        const valor = formData.get(variable) as string
        if (valor) {
          datosPersonalizados[variable] = valor
        }
      }
    }

    const plantillaPath = plantilla.file.path
    if (!storage.fileExists(plantillaPath)) {
      return {
        success: false,
        error: 'Archivo de plantilla no encontrado en el servidor'
      }
    }

    const buffer = await storage.readFile(plantillaPath)

    const zip = new PizZip(buffer)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    })

    doc.render(datosPersonalizados)

    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    })

    const pdfBuffer = await convertDocxToPdf(docxBuffer)

    const codigo = crypto.randomBytes(5).toString('hex').toUpperCase()
    const nombrePdf = `certificado-${codigo}.pdf`

    await storage.initialize()

    const filePath = await storage.saveFile(nombrePdf, pdfBuffer, {
      folder: 'certificates'
    })

    const pdfUrl = storage.getPublicUrl(filePath, process.env.NEXT_PUBLIC_APP_URL || '')

    const archivoPdf = await prisma.file.create({
      data: {
        name: path.basename(filePath),
        url: pdfUrl,
        type: 'application/pdf',
        sizeInBytes: BigInt(pdfBuffer.length),
        mimeType: 'application/pdf',
        originalName: nombrePdf,
        path: filePath
      }
    })

    const certificado = await prisma.certificate.create({
      data: {
        code: codigo,
        userId: usuarioId,
        courseId: cursoId,
        templateId: plantilla.id,
        fileId: archivoPdf.id,
        customData: datosPersonalizados
      }
    })

    revalidatePath('/certificados')

    return {
      success: true,
      pdfUrl: pdfUrl,
      certificadoId: certificado.id
    }
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'P2002') {
      return {
        success: false,
        error: 'Ya existe un certificado para este usuario y curso.'
      }
    }
    if (error instanceof Error && (error as any).code === 'P2003') {
      const field = (error as any).meta?.field_name
      if (field === 'usuarioId') {
        return {
          success: false,
          error: 'Error de clave foránea: El usuario no existe.'
        }
      }
      if (field === 'cursoId') {
        return {
          success: false,
          error: 'Error de clave foránea: El curso no existe.'
        }
      }
      return {
        success: false,
        error: `Error de clave foránea: ${field} no existe.`
      }
    }
    return { success: false, error: 'Error al generar certificado' }
  }
}

export async function getCertificados() {
  try {
    const certificados = await prisma.certificate.findMany({
      include: {
        template: true,
        file: true,
        user: {
          select: { id: true, profile: { select: { name: true } }, email: true }
        },
        course: {
          select: { id: true, title: true }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })
    return certificados
  } catch (_error) {
    return []
  }
}
