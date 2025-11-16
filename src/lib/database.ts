import { prisma } from './prisma'
import { serializarCursoCompleto, serializarCursos } from './serialization'

class Database {
  async getAllCourses() {
    const cursos = await prisma.curso.findMany({
      include: {
        categoria: true,
        inscripciones: true,
        modulos: true,
        resenas: true,
        etiquetas: true,
        compras: true,
        imagen: true
      }
    })
    return serializarCursos(cursos)
  }

  async getCoursesByInstructorId(instructorId: string) {
    const cursos = await prisma.curso.findMany({
      where: { instructorId },
      include: {
        categoria: true,
        inscripciones: true,
        modulos: true,
        resenas: true,
        etiquetas: true,
        compras: true,
        imagen: true
      }
    })
    return serializarCursos(cursos)
  }

  async getCourseBySlug(slug: string) {
    const curso = await prisma.curso.findUnique({
      where: {
        slug
      },
      include: {
        categoria: true,
        etiquetas: true,
        modulos: {
          orderBy: {
            posicion: 'asc'
          },
          include: {
            lecciones: {
              orderBy: {
                posicion: 'asc'
              },
              select: {
                id: true,
                titulo: true,
                esGratis: true
              }
            }
          }
        },
        inscripciones: true,
        resenas: true,
        compras: true,
        imagen: true
      }
    })
    return curso ? serializarCursoCompleto(curso) : null
  }

  async getInstructorById(courseId: string) {
    const course = await prisma.curso.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    })
    if (!course) return null

    return await prisma.usuario.findUnique({
      where: { id: course.instructorId }
    })
  }
}

export const database = new Database()
