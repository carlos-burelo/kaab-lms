/**
 * Serialización de objetos Prisma para uso en componentes cliente
 * Convierte tipos que no son serializables (Decimal, Date) a tipos JSON-safe
 */

/**
 * Serializa un curso eliminando Decimal y otros tipos no serializables
 */
export const serializeCurso = (curso: any) => ({
  ...curso,
  precio: curso.precio ? Number(curso.precio) : 0,
  precioDescuento: curso.precioDescuento ? Number(curso.precioDescuento) : null,
  calificacion: curso.calificacion ? Number(curso.calificacion) : 0,
  totalResenas: curso.totalResenas || 0,
  duracionMinutos: curso.duracionMinutos || 0,
  // También convertir fechas a strings si existen
  creadoEn: curso.creadoEn ? new Date(curso.creadoEn).toISOString() : null,
  actualizadoEn: curso.actualizadoEn ? new Date(curso.actualizadoEn).toISOString() : null,
  fechaPublicacion: curso.fechaPublicacion ? new Date(curso.fechaPublicacion).toISOString() : null
})

/**
 * Serializa un array de cursos
 */
export const serializarCursos = (cursos: any[]) => cursos.map(serializeCurso)

/**
 * Serializa una lección
 */
export const serializarLeccion = (leccion: any) => ({
  ...leccion,
  duracionMinutos: leccion.duracionMinutos || 0,
  creadoEn: leccion.creadoEn ? new Date(leccion.creadoEn).toISOString() : null,
  actualizadoEn: leccion.actualizadoEn ? new Date(leccion.actualizadoEn).toISOString() : null
})

/**
 * Serializa un módulo con sus lecciones
 */
export const serializarModulo = (modulo: any) => ({
  ...modulo,
  lecciones: modulo.lecciones ? modulo.lecciones.map(serializarLeccion) : [],
  creadoEn: modulo.creadoEn ? new Date(modulo.creadoEn).toISOString() : null,
  actualizadoEn: modulo.actualizadoEn ? new Date(modulo.actualizadoEn).toISOString() : null
})

/**
 * Serializa un curso completo con todos sus módulos, lecciones y contenido
 */
export const serializarCursoCompleto = (curso: any) => ({
  ...serializeCurso(curso),
  modulos: curso.modulos ? curso.modulos.map(serializarModulo) : []
})

/**
 * Serializa una reseña
 */
export const serializarResena = (resena: any) => ({
  ...resena,
  calificacion: resena.calificacion || 0,
  creadoEn: resena.creadoEn ? new Date(resena.creadoEn).toISOString() : null,
  actualizadoEn: resena.actualizadoEn ? new Date(resena.actualizadoEn).toISOString() : null
})

/**
 * Serializa un contenido de lección
 */
export const serializarContenido = (contenido: any) => ({
  ...contenido,
  creadoEn: contenido.creadoEn ? new Date(contenido.creadoEn).toISOString() : null,
  actualizadoEn: contenido.actualizadoEn ? new Date(contenido.actualizadoEn).toISOString() : null
})
