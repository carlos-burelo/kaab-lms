/**
 * Database Index - Compatibilidad hacia atrás
 * Proporciona interfaces que el código legado espera
 */

/**
 * estudientsDatabase - Compatibilidad con código que importa studentsDatabase desde @/database
 */
export const studentsDatabase = {
  getStudentCourses: () => {
    throw new Error('Use studentRepository.getEnrolledCourses() instead. This requires session context.')
  }
}

/**
 * instructorDatabase - Compatibilidad con código que importa instructorDatabase desde @/database
 * DEPRECADO: Usar instructorRepository directamente
 */
export const instructorDatabase = {
  getInstructorCourses: () => {
    throw new Error('Use instructorRepository.getMyCourses() instead. This requires session context.')
  },
  getPersonalTasks: () => {
    throw new Error('Use instructorRepository.getPersonalTasks(userId) instead. This requires session context.')
  }
}

// Re-exportar repositorios
export { courseRepository, instructorRepository, studentRepository, userRepository } from './repositories'
