/**
 * Central export point for all repositories
 * Permite acceso fácil a los repositorios por rol
 *
 * Uso:
 * import { studentRepository, instructorRepository, adminRepository } from '@/database/repositories'
 *
 * // En acciones de estudiante
 * const enrolledCourses = await studentRepository.getEnrolledCourses(userId)
 *
 * // En acciones de instructor
 * const myCourses = await instructorRepository.getMyCourses(instructorId)
 *
 * // En acciones admin
 * const stats = await adminRepository.getSystemStatistics()
 */

export { AdminRepository, adminRepository } from './admin.repository'
export { BaseRepository } from './base.repository'
export { CalendarRepository, calendarRepository } from './calendar.repository'
export { CourseRepository, courseRepository } from './course.repository'
export { EnrollmentRepository, enrollmentRepository } from './enrollment.repository'
export { FileRepository, fileRepository } from './file.repository'
export { InstructorRepository, instructorRepository } from './instructor.repository'
export { QuizRepository, quizRepository } from './quiz.repository'
export { StudentRepository, studentRepository } from './student.repository'
export { UserRepository, userRepository } from './user.repository'
