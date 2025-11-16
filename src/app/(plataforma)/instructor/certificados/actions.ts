'use server'

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Docxtemplater from 'docxtemplater'
import { revalidatePath } from 'next/cache'
import PizZip from 'pizzip'
import { getSession } from '@/lib/auth' // ¡Importante! Para obtener el usuario real
import { convertDocxToPdf } from '@/lib/docx-to-pdf' // Usa el conversor local
import { prisma } from '@/lib/prisma'

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

    // guardar archivo en el filesystem local en /public/certificados/
    const certificadosDir = path.join(process.cwd(), 'public', 'certificados')
    if (!fs.existsSync(certificadosDir)) {
      fs.mkdirSync(certificadosDir, { recursive: true })
    }

    // Asegurar un nombre de archivo único para evitar sobrescrituras
    const nombreArchivoUnico = `${crypto.randomUUID()}-${archivo.name}`
    const filePath = path.join(certificadosDir, nombreArchivoUnico)
    const arrayBuffer = await archivo.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

    const blob = {
      url: `/certificados/${nombreArchivoUnico}`,
      key: filePath // Guardamos la ruta completa del sistema de archivos
    }

    // Crear registro de archivo
    const archivoRecord = await prisma.file.create({
      data: {
        name: nombreArchivoUnico,
        url: blob.url,
        type: archivo.type,
        sizeInBytes: BigInt(archivo.size), // Usar BigInt
        mimeType: archivo.type,
        originalName: archivo.name,
        path: blob.key // Guardar la ruta completa
      }
    })

    // Crear plantilla
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
  } catch {
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
  } catch {
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

    // Usar una transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar certificados asociados (si es necesario por las reglas de tu app)
      await tx.certificate.deleteMany({
        where: { templateId: id }
      })

      // 2. Eliminar la plantilla
      await tx.certificateTemplate.delete({
        where: { id }
      })

      // 3. Eliminar el registro de archivo en la DB
      await tx.file.delete({
        where: { id: plantilla.fileId }
      })
    })

    // 4. Eliminar el archivo físico del filesystem
    try {
      if (plantilla.file?.path && fs.existsSync(plantilla.file.path)) {
        fs.unlinkSync(plantilla.file.path)
      }
    } catch {}

    revalidatePath('/plantillas')
    return { success: true }
  } catch {
    return { success: false, error: 'Error al eliminar plantilla' }
  }
}

/**
 * Genera un certificado a partir de una plantilla y datos.
 * Esta acción ahora es llamada desde un componente de cliente.
 */
export async function generarCertificado(
  formData: FormData
): Promise<{ success: boolean; pdfUrl?: string; error?: string; certificadoId?: string }> {
  try {
    // --- INICIO DE CORRECCIÓN DE PRISMA ---
    // 1. Obtener la sesión del usuario autenticado
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'Usuario no autenticado' }
    }
    const usuarioId = session.id // Usar el ID real de la sesión

    // 2. Obtener plantillaId y cursoId desde el formulario
    const plantillaId = formData.get('plantillaId') as string
    const cursoId = formData.get('cursoId') as string // ¡Importante!

    if (!plantillaId || !cursoId) {
      return {
        success: false,
        error: 'Faltan plantillaId o cursoId en el formulario'
      }
    }
    // --- FIN DE CORRECCIÓN DE PRISMA ---

    // Obtener plantilla
    const plantilla = await prisma.certificateTemplate.findUnique({
      where: { id: plantillaId },
      include: { file: true }
    })

    if (!plantilla || !plantilla.file) {
      return { success: false, error: 'Plantilla o archivo no encontrado' }
    }

    // Extraer datos personalizados
    const datosPersonalizados: Record<string, string> = {}
    if (Array.isArray(plantilla.variables)) {
      for (const variable of plantilla.variables as string[]) {
        const valor = formData.get(variable) as string
        if (valor) {
          datosPersonalizados[variable] = valor
        }
      }
    }

    // Leer plantilla Word desde el filesystem local usando la 'ruta'
    const plantillaPath = plantilla.file.path
    if (!fs.existsSync(plantillaPath)) {
      return {
        success: false,
        error: 'Archivo de plantilla no encontrado en el servidor'
      }
    }
    const buffer = fs.readFileSync(plantillaPath)

    // Procesar plantilla con docxtemplater
    const zip = new PizZip(buffer)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    })

    // Reemplazar variables
    doc.render(datosPersonalizados)

    // Generar documento Word modificado
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    })

    // Convertir a PDF usando el conversor local de LibreOffice
    const pdfBuffer = await convertDocxToPdf(docxBuffer)

    // Generar código único para el certificado
    const codigo = crypto.randomBytes(5).toString('hex').toUpperCase()
    const nombrePdf = `certificado-${codigo}.pdf`

    // guardar pdf en el filesystem local en /public/certificados/
    const certificadosDir = path.join(process.cwd(), 'public', 'certificados')
    if (!fs.existsSync(certificadosDir)) {
      fs.mkdirSync(certificadosDir, { recursive: true })
    }
    const filePath = path.join(certificadosDir, nombrePdf)
    fs.writeFileSync(filePath, pdfBuffer)

    const pdfUrl = `/certificados/${nombrePdf}`

    // Crear registro de archivo PDF
    const archivoPdf = await prisma.file.create({
      data: {
        name: nombrePdf,
        url: pdfUrl,
        type: 'application/pdf',
        sizeInBytes: BigInt(pdfBuffer.length), // Usar BigInt
        mimeType: 'application/pdf',
        originalName: nombrePdf,
        path: filePath // Guardar la ruta completa
      }
    })

    // Crear certificado
    const certificado = await prisma.certificate.create({
      data: {
        code: codigo,
        userId: usuarioId, // Usar el ID real
        courseId: cursoId, // Usar el ID del form
        templateId: plantilla.id,
        fileId: archivoPdf.id,
        customData: datosPersonalizados
        // datosPersonalizados
      }
    })

    revalidatePath('/certificados')

    // Devolver la URL del PDF generado localmente
    return {
      success: true,
      pdfUrl: pdfUrl,
      certificadoId: certificado.id
    }
  } catch (error) {
    if (
      error instanceof Error &&
      (error as any).code === 'P2002' // Código de Prisma para Unique constraint failed
    ) {
      return {
        success: false,
        error: 'Ya existe un certificado para este usuario y curso.'
      }
    }
    if (
      error instanceof Error &&
      (error as any).code === 'P2003' // Foreign key constraint failed
    ) {
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
          select: { id: true, profile: { select: { name: true } }, email: true } // Solo traer datos necesarios
        },
        course: {
          select: { id: true, title: true } // Solo traer datos necesarios
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })
    return certificados
  } catch {
    return []
  }
}
