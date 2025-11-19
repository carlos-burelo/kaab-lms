/**
 * Server Actions - Main Barrel Export
 * Exporta todas las server actions organizadas por dominio y rol
 */

// ============ SHARED UTILITIES ============
export * from './_shared/action-builder'
export * from './_shared/session'
export * from './_shared/validators'
// ============ ADMIN ACTIONS ============
export * as AdminActions from './admin'

// ============ INSTRUCTOR ACTIONS ============
export * as InstructorActions from './instructor'
// ============ PUBLIC ACTIONS ============
export * as PublicActions from './public'
// ============ STUDENT ACTIONS ============
export * as StudentActions from './student'

/**
 * USAGE EXAMPLES:
 *
 * // Import all student actions
 * import { StudentActions } from "@/actions"
 * const result = await StudentActions.getEnrolledCourses({})
 *
 * // Import specific action
 * import { getEnrolledCourses } from "@/actions/student/enrollment.actions"
 * const result = await getEnrolledCourses({})
 *
 * // Import all instructor actions
 * import { InstructorActions } from "@/actions"
 * const courses = await InstructorActions.getMyCourses({})
 */
