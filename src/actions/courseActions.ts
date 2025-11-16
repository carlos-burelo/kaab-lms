/**
 * DEPRECATED: Usar src/actions/course.actions.ts en su lugar
 * Este archivo mantiene compatibilidad hacia atrás re-exportando todas las funciones
 */
export {
  createCourseBasicInfo,
  createLesson,
  createLessonContent,
  createModule,
  deleteLesson,
  deleteLessonContent,
  deleteModule,
  getAvailableCourses,
  getCategories,
  getCourseById,
  getFeaturedCourses,
  getLessonById,
  getMyCourses,
  getSessionForUpload,
  getUploadedFiles,
  publishCourse,
  searchCourses,
  unpublishCourse,
  updateContentPositions,
  updateCourseBasicInfo,
  updateLesson,
  updateLessonContent,
  updateModule,
  uploadFile
} from './course.actions'
