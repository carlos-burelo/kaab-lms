import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fakerES as f } from '@faker-js/faker'
import {
  AchievementSourceType,
  AchievementType,
  AnnouncementPlacement,
  BadgeRarity,
  ContentType,
  CourseLevel,
  EventType,
  MissionDifficulty,
  MissionType,
  NotificationType,
  PaymentMethodType,
  PaymentStatus,
  PaymentType,
  PersonalTaskStatus,
  PlanInterval,
  PrismaClient,
  QuestionType,
  RewardType,
  SubscriptionStatus,
  TaskPriority,
  UserRole
} from '@prisma/client'
import bcrypt from 'bcryptjs'

// Inicializar Prisma Client
const prisma = new PrismaClient()

// Rondas de Hashing para contraseñas
const BCRYPT_ROUNDS = 10

// Constantes
const DEFAULT_PASSWORD = 'password123'
const NUM_STUDENTS = 50
const NUM_INSTRUCTORS = 10
const NUM_CATEGORIES = 8

// Directorios para archivos
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public')
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads')
const COURSES_DIR = path.join(UPLOADS_DIR, 'courses')
const CATEGORIES_DIR = path.join(UPLOADS_DIR, 'categories')
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos')
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, 'documents')
const BADGES_DIR = path.join(UPLOADS_DIR, 'badges')
const ACHIEVEMENTS_DIR = path.join(UPLOADS_DIR, 'achievements')
const REWARDS_DIR = path.join(UPLOADS_DIR, 'rewards')
const CERTIFICATES_DIR = path.join(PUBLIC_DIR, 'certificados')
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars')

/**
 * Crear directorios necesarios
 */
function ensureDirectories() {
  const dirs = [
    UPLOADS_DIR,
    COURSES_DIR,
    CATEGORIES_DIR,
    VIDEOS_DIR,
    DOCUMENTS_DIR,
    BADGES_DIR,
    ACHIEVEMENTS_DIR,
    REWARDS_DIR,
    CERTIFICATES_DIR,
    AVATARS_DIR
  ]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

/**
 * Descargar imagen desde URL
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
    console.log(`  ✓ Descargado: ${path.basename(filepath)}`)
  } catch (error) {
    console.error(`  ✗ Error descargando ${filepath}:`, error)
    throw error
  }
}

/**
 * Crear archivo de video de ejemplo (placeholder)
 */
function createVideoPlaceholder(filepath: string, durationSeconds: number): void {
  // Crear un archivo placeholder para videos
  const metadata = {
    type: 'video/mp4',
    duration: durationSeconds,
    placeholder: true,
    note: 'Este es un archivo placeholder. Reemplazar con video real.'
  }
  fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2))
  console.log(`  ✓ Creado placeholder: ${path.basename(filepath)}`)
}

/**
 * Crear documento PDF de ejemplo (placeholder)
 */
function createDocumentPlaceholder(filepath: string): void {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Documento de ejemplo) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000270 00000 n 
0000000363 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
451
%%EOF`
  fs.writeFileSync(filepath, content)
  console.log(`  ✓ Creado PDF: ${path.basename(filepath)}`)
}

/**
 * Generar SVG de badge/achievement/reward
 */
function createSVGIcon(filepath: string, seed: string, type: 'badge' | 'achievement' | 'reward'): void {
  const colors = {
    badge: ['#FFD700', '#FFA500', '#FF6347'],
    achievement: ['#4169E1', '#9370DB', '#20B2AA'],
    reward: ['#FF69B4', '#FF1493', '#C71585']
  }
  const colorSet = colors[type]
  const color = colorSet[Math.abs(hashCode(seed)) % colorSet.length]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(color, -30)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="80" fill="url(#grad${seed})" />
  <path d="M 100 40 L 110 70 L 140 75 L 115 95 L 122 125 L 100 110 L 78 125 L 85 95 L 60 75 L 90 70 Z" fill="#FFF" opacity="0.8"/>
  <text x="100" y="160" text-anchor="middle" font-size="12" fill="#FFF" font-family="Arial">${type.toUpperCase()}</text>
</svg>`

  fs.writeFileSync(filepath, svg)
  console.log(`  ✓ Creado SVG: ${path.basename(filepath)}`)
}

/**
 * Hash simple para generar colores consistentes
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

/**
 * Ajustar brillo de color hexadecimal
 */
function adjustBrightness(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear directorios
  console.log('📁 Creando directorios...')
  ensureDirectories()

  // Limpiar datos existentes
  await cleanDatabase()

  // 1. Crear usuarios (Administradores, Estudiantes, Instructores)
  console.log('👥 Creando usuarios...')
  const { students, instructors } = await createUsers()

  // 2. Crear archivos de ejemplo
  console.log('📁 Creando archivos...')
  const files = await createFiles()

  // 3. Crear categorías
  console.log('📂 Creando categorías...')
  const categories = await createCategories(files)

  // 4. Crear tags
  console.log('🏷️  Creando tags...')
  const tags = await createTags()

  // 5. Crear cursos
  console.log('📚 Creando cursos...')
  const courses = await createCourses(instructors, categories, tags, files)

  // 6. Crear módulos y lecciones
  console.log('📖 Creando módulos y lecciones...')
  await createModulesAndLessons(courses, files)

  // 7. Crear inscripciones
  console.log('✍️  Creando inscripciones...')
  await createEnrollments(students, courses)

  // 8. Crear reseñas
  console.log('⭐ Creando reseñas...')
  await createReviews(students, courses)

  // 9. Crear sistema de gamificación
  console.log('🎮 Creando sistema de gamificación...')
  await createGamificationSystem(students, files)

  // 10. Crear planes de suscripción
  console.log('💳 Creando planes de suscripción...')
  const plans = await createSubscriptionPlans()

  // 11. Crear suscripciones y pagos
  console.log('💰 Creando suscripciones y pagos...')
  await createSubscriptionsAndPayments(students, plans, courses)

  // 12. Crear certificados
  console.log('🎓 Creando certificados...')
  await createCertificates(students, courses, files)

  // 13. Crear discusiones
  console.log('💬 Creando discusiones...')
  await createDiscussions(students, courses)

  // 14. Crear notificaciones
  console.log('🔔 Creando notificaciones...')
  await createNotifications(students)

  // 15. Crear anuncios
  console.log('📢 Creando anuncios...')
  await createAnnouncements(courses, files)

  // 16. Crear tareas personales y eventos
  console.log('📅 Creando tareas personales y eventos...')
  await createPersonalTasksAndEvents(students)

  // 17. Crear rutas de aprendizaje
  console.log('🛤️  Creando rutas de aprendizaje...')
  await createLearningPaths(courses, files)

  console.log('✅ Seed completado exitosamente!')
}

/**
 * Limpiar la base de datos
 */
async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos...')

  // Desactivar verificación de claves foráneas
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`

  // Eliminar datos en orden inverso de dependencias
  await prisma.userAnnouncementView.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.personalTask.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.certificateTemplate.deleteMany()
  await prisma.userReward.deleteMany()
  await prisma.missionReward.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.userMission.deleteMany()
  await prisma.mission.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.userXpRecord.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.discussionPost.deleteMany()
  await prisma.discussionThread.deleteMany()
  await prisma.review.deleteMany()
  await prisma.userAnswer.deleteMany()
  await prisma.userQuizAttempt.deleteMany()
  await prisma.answerOption.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.assignmentSubmission.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.userLessonProgress.deleteMany()
  await prisma.lessonAttachment.deleteMany()
  await prisma.lessonContent.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.courseLearningPath.deleteMany()
  await prisma.learningPath.deleteMany()
  await prisma.course.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.instructorProfile.deleteMany()
  await prisma.userGamification.deleteMany()
  await prisma.userPreferences.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.file.deleteMany()
  await prisma.user.deleteMany()

  // Reactivar verificación de claves foráneas
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`

  console.log('✅ Base de datos limpiada')
}

/**
 * Crear usuarios
 */
async function createUsers() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS)

  // Descargar avatar del admin
  console.log('  👤 Descargando avatar del administrador...')
  const adminAvatarFilename = 'admin-avatar.svg'
  const adminAvatarPath = path.join(AVATARS_DIR, adminAvatarFilename)
  await downloadImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=admin`, adminAvatarPath)

  // Crear administrador
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kaab.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          name: 'Administrador Principal',
          imageUrl: `/uploads/avatars/${adminAvatarFilename}`,
          bio: 'Administrador de la plataforma Kaab',
          lastActivity: new Date()
        }
      },
      gamification: {
        create: {
          xp: 10000,
          level: 50,
          coins: 5000,
          streak: 365
        }
      },
      preferences: {
        create: {
          preferences: { theme: 'dark', language: 'es', notifications: true }
        }
      }
    }
  })

  // Crear instructores
  console.log('  👨‍🏫 Descargando avatares de instructores...')
  const instructors = await Promise.all(
    Array.from({ length: NUM_INSTRUCTORS }, async (_, i) => {
      const firstName = f.person.firstName()
      const lastName = f.person.lastName()
      const email = f.internet.email({ firstName, lastName }).toLowerCase()

      // Descargar avatar
      const avatarFilename = `instructor-${i + 1}.svg`
      const avatarPath = path.join(AVATARS_DIR, avatarFilename)
      await downloadImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`, avatarPath)

      return prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.INSTRUCTOR,
          emailVerified: f.datatype.boolean() ? f.date.past() : null,
          profile: {
            create: {
              name: `${firstName} ${lastName}`,
              imageUrl: `/uploads/avatars/${avatarFilename}`,
              bio: f.lorem.paragraph(),
              socialLinks: {
                linkedin: f.internet.url(),
                twitter: f.internet.url(),
                website: f.internet.url()
              },
              lastActivity: f.date.recent()
            }
          },
          gamification: {
            create: {
              xp: f.number.int({ min: 1000, max: 50000 }),
              level: f.number.int({ min: 5, max: 30 }),
              coins: f.number.int({ min: 100, max: 5000 }),
              streak: f.number.int({ min: 0, max: 100 })
            }
          },
          preferences: {
            create: {
              preferences: {
                theme: f.helpers.arrayElement(['light', 'dark']),
                language: 'es',
                notifications: true
              }
            }
          },
          instructorProfile: {
            create: {
              publicBio: f.lorem.paragraphs(2),
              qualifications: {
                certifications: ['Certificado en Educación en Línea', 'Maestría en Educación'],
                experience: f.number.int({ min: 2, max: 15 })
              },
              payoutDetails: {
                bankAccount: f.finance.accountNumber(),
                taxId: f.string.alphanumeric(13).toUpperCase()
              },
              averageRating: f.number.float({ min: 3.5, max: 5, multipleOf: 0.1 }),
              totalStudents: f.number.int({ min: 0, max: 1000 })
            }
          }
        },
        include: {
          profile: true
        }
      })
    })
  )

  // Crear estudiantes
  console.log('  👨‍🎓 Descargando avatares de estudiantes...')
  const students = await Promise.all(
    Array.from({ length: NUM_STUDENTS }, async (_, i) => {
      const firstName = f.person.firstName()
      const lastName = f.person.lastName()
      const email = f.internet.email({ firstName, lastName }).toLowerCase()

      // Descargar avatar
      const avatarFilename = `student-${i + 1}.svg`
      const avatarPath = path.join(AVATARS_DIR, avatarFilename)
      await downloadImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`, avatarPath)

      return prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.STUDENT,
          emailVerified: f.datatype.boolean() ? f.date.past() : null,
          profile: {
            create: {
              name: `${firstName} ${lastName}`,
              imageUrl: `/uploads/avatars/${avatarFilename}`,
              bio: f.lorem.sentence(),
              socialLinks: f.datatype.boolean()
                ? {
                    linkedin: f.internet.url(),
                    github: f.internet.url()
                  }
                : undefined,
              lastActivity: f.date.recent()
            }
          },
          gamification: {
            create: {
              xp: f.number.int({ min: 0, max: 10000 }),
              level: f.number.int({ min: 1, max: 20 }),
              coins: f.number.int({ min: 0, max: 2000 }),
              streak: f.number.int({ min: 0, max: 50 })
            }
          },
          preferences: {
            create: {
              preferences: {
                theme: f.helpers.arrayElement(['light', 'dark', 'auto']),
                language: 'es',
                notifications: f.datatype.boolean()
              }
            }
          }
        },
        include: {
          profile: true
        }
      })
    })
  )

  return { admin, students, instructors }
}

/**
 * Crear archivos de ejemplo
 */
async function createFiles() {
  const files: any[] = []

  // Imágenes de cursos
  console.log('  📸 Descargando imágenes de cursos...')
  for (let i = 0; i < 30; i++) {
    const filename = `course-image-${i + 1}.jpg`
    const filepath = path.join(COURSES_DIR, filename)
    const url = `https://picsum.photos/seed/course${i + 1}/800/600`

    await downloadImage(url, filepath)

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `course-${i + 1}.jpg`,
        path: `/uploads/courses/${filename}`,
        url: `/uploads/courses/${filename}`,
        type: 'image',
        mimeType: 'image/jpeg',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        width: 800,
        height: 600,
        folder: 'courses',
        isPublic: true
      }
    })
    files.push(file)
  }

  // Imágenes de categorías
  console.log('  📸 Descargando imágenes de categorías...')
  for (let i = 0; i < 10; i++) {
    const filename = `category-image-${i + 1}.jpg`
    const filepath = path.join(CATEGORIES_DIR, filename)
    const url = `https://picsum.photos/seed/category${i + 1}/400/300`

    await downloadImage(url, filepath)

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `category-${i + 1}.jpg`,
        path: `/uploads/categories/${filename}`,
        url: `/uploads/categories/${filename}`,
        type: 'image',
        mimeType: 'image/jpeg',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        width: 400,
        height: 300,
        folder: 'categories',
        isPublic: true
      }
    })
    files.push(file)
  }

  // Videos (placeholders)
  console.log('  🎥 Creando videos placeholder...')
  for (let i = 0; i < 20; i++) {
    const filename = `video-lesson-${i + 1}.mp4`
    const filepath = path.join(VIDEOS_DIR, filename)
    const durationSeconds = f.number.int({ min: 300, max: 3600 })

    createVideoPlaceholder(filepath, durationSeconds)

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `lesson-${i + 1}.mp4`,
        path: `/uploads/videos/${filename}`,
        url: `/uploads/videos/${filename}`,
        type: 'video',
        mimeType: 'video/mp4',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        durationInSeconds: durationSeconds,
        folder: 'videos',
        isPublic: false
      }
    })
    files.push(file)
  }

  // Documentos PDF
  console.log('  📄 Creando documentos PDF...')
  for (let i = 0; i < 10; i++) {
    const filename = `document-${i + 1}.pdf`
    const filepath = path.join(DOCUMENTS_DIR, filename)

    createDocumentPlaceholder(filepath)

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `document-${i + 1}.pdf`,
        path: `/uploads/documents/${filename}`,
        url: `/uploads/documents/${filename}`,
        type: 'document',
        mimeType: 'application/pdf',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        folder: 'documents',
        isPublic: false
      }
    })
    files.push(file)
  }

  // Badges
  console.log('  🏅 Creando badges SVG...')
  for (let i = 0; i < 15; i++) {
    const filename = `badge-${i + 1}.svg`
    const filepath = path.join(BADGES_DIR, filename)

    createSVGIcon(filepath, `badge${i + 1}`, 'badge')

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `badge-${i + 1}.svg`,
        path: `/uploads/badges/${filename}`,
        url: `/uploads/badges/${filename}`,
        type: 'image',
        mimeType: 'image/svg+xml',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        folder: 'badges',
        isPublic: true
      }
    })
    files.push(file)
  }

  // Achievements
  console.log('  🏆 Creando achievements SVG...')
  for (let i = 0; i < 15; i++) {
    const filename = `achievement-${i + 1}.svg`
    const filepath = path.join(ACHIEVEMENTS_DIR, filename)

    createSVGIcon(filepath, `achievement${i + 1}`, 'achievement')

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `achievement-${i + 1}.svg`,
        path: `/uploads/achievements/${filename}`,
        url: `/uploads/achievements/${filename}`,
        type: 'image',
        mimeType: 'image/svg+xml',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        folder: 'achievements',
        isPublic: true
      }
    })
    files.push(file)
  }

  // Rewards
  console.log('  🎁 Creando rewards SVG...')
  for (let i = 0; i < 10; i++) {
    const filename = `reward-${i + 1}.svg`
    const filepath = path.join(REWARDS_DIR, filename)

    createSVGIcon(filepath, `reward${i + 1}`, 'reward')

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `reward-${i + 1}.svg`,
        path: `/uploads/rewards/${filename}`,
        url: `/uploads/rewards/${filename}`,
        type: 'image',
        mimeType: 'image/svg+xml',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        folder: 'rewards',
        isPublic: true
      }
    })
    files.push(file)
  }

  // Certificate templates
  console.log('  📜 Creando plantillas de certificados...')
  for (let i = 0; i < 3; i++) {
    const filename = `certificate-template-${i + 1}.pdf`
    const filepath = path.join(CERTIFICATES_DIR, filename)

    createDocumentPlaceholder(filepath)

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: `template-${i + 1}.pdf`,
        path: `/certificados/${filename}`,
        url: `/certificados/${filename}`,
        type: 'document',
        mimeType: 'application/pdf',
        sizeInBytes: BigInt(fs.statSync(filepath).size),
        folder: 'certificates',
        isPublic: false
      }
    })
    files.push(file)
  }

  return files
}

/**
 * Crear categorías
 */
async function createCategories(files: any[]) {
  const categoryImages = files.filter((f) => f.folder === 'categories')

  const categoryData = [
    {
      name: 'Programación',
      slug: 'programacion',
      description: 'Aprende a programar desde cero o mejora tus habilidades'
    },
    {
      name: 'Diseño',
      slug: 'diseno',
      description: 'Domina el diseño gráfico, UX/UI y más'
    },
    {
      name: 'Marketing Digital',
      slug: 'marketing-digital',
      description: 'Estrategias de marketing para el mundo digital'
    },
    {
      name: 'Negocios',
      slug: 'negocios',
      description: 'Emprendimiento, administración y finanzas'
    },
    {
      name: 'Idiomas',
      slug: 'idiomas',
      description: 'Aprende nuevos idiomas de forma efectiva'
    },
    {
      name: 'Desarrollo Personal',
      slug: 'desarrollo-personal',
      description: 'Mejora tus habilidades blandas y productividad'
    },
    {
      name: 'Ciencia de Datos',
      slug: 'ciencia-de-datos',
      description: 'Big Data, Machine Learning e IA'
    },
    {
      name: 'Fotografía y Video',
      slug: 'fotografia-video',
      description: 'Captura y edita contenido visual profesional'
    }
  ]

  const categories = await Promise.all(
    categoryData.map(async (cat, i) => {
      return prisma.category.create({
        data: {
          ...cat,
          imageId: categoryImages[i]?.id,
          position: i,
          isActive: true
        }
      })
    })
  )

  // Crear algunas subcategorías
  const subCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'JavaScript',
        slug: 'javascript',
        description: 'Desarrollo con JavaScript',
        parentId: categories[0].id,
        position: 0,
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Python',
        slug: 'python',
        description: 'Programación con Python',
        parentId: categories[0].id,
        position: 1,
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'UX/UI Design',
        slug: 'ux-ui-design',
        description: 'Diseño de experiencia e interfaz de usuario',
        parentId: categories[1].id,
        position: 0,
        isActive: true
      }
    })
  ])

  return [...categories, ...subCategories]
}

/**
 * Crear tags
 */
async function createTags() {
  const tagNames = [
    'Frontend',
    'Backend',
    'Full Stack',
    'Mobile',
    'Web',
    'API',
    'Database',
    'DevOps',
    'Cloud',
    'Security',
    'Testing',
    'Agile',
    'SEO',
    'Analytics',
    'Social Media',
    'E-commerce',
    'Beginner Friendly',
    'Advanced',
    'Certificación',
    'Práctico'
  ]

  return Promise.all(
    tagNames.map((name) =>
      prisma.tag.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }
      })
    )
  )
}

/**
 * Crear cursos
 */
async function createCourses(instructors: any[], categories: any[], tags: any[], files: any[]) {
  const courseImages = files.filter((f) => f.folder === 'courses')

  const courseTitles = [
    'Desarrollo Web Full Stack con React y Node.js',
    'Python para Ciencia de Datos',
    'Diseño UX/UI desde Cero',
    'Marketing Digital Avanzado',
    'Inglés para Negocios',
    'Introducción a Machine Learning',
    'Fotografía Profesional',
    'Emprendimiento Digital',
    'JavaScript Moderno: ES6+',
    'Bases de Datos con MySQL',
    'Git y GitHub para Desarrolladores',
    'React Native: Apps Móviles',
    'SEO y SEM Práctico',
    'Excel Avanzado para Análisis',
    'Ilustración Digital con Procreate',
    'Productividad y Gestión del Tiempo',
    'TypeScript para Desarrolladores',
    'Cloud Computing con AWS',
    'Animación 3D con Blender',
    'Finanzas Personales',
    'Desarrollo de APIs REST',
    'Diseño Gráfico con Adobe Creative Suite',
    'Data Science con R',
    'Copywriting Persuasivo',
    'Desarrollo de Videojuegos con Unity'
  ]

  return Promise.all(
    courseTitles.map(async (title, i) => {
      const instructor = f.helpers.arrayElement(instructors)
      const category = f.helpers.arrayElement(categories.slice(0, NUM_CATEGORIES))
      const courseTags = f.helpers.arrayElements(tags, f.number.int({ min: 2, max: 5 }))
      const price = f.number.float({ min: 299, max: 1999, multipleOf: 0.01 })
      const discount = f.datatype.boolean() ? f.number.float({ min: price * 0.5, max: price * 0.9, multipleOf: 0.01 }) : null

      return prisma.course.create({
        data: {
          slug: title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          instructorId: instructor.id,
          title,
          description: f.lorem.paragraphs(3),
          imageId: courseImages[i % courseImages.length]?.id,
          price,
          discountPrice: discount,
          rating: f.number.float({ min: 3.5, max: 5, multipleOf: 0.1 }),
          totalReviews: f.number.int({ min: 0, max: 500 }),
          level: f.helpers.arrayElement([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]),
          durationMinutes: f.number.int({ min: 180, max: 3000 }),
          requirements: [f.lorem.sentence(), f.lorem.sentence(), f.lorem.sentence()],
          objectives: [f.lorem.sentence(), f.lorem.sentence(), f.lorem.sentence(), f.lorem.sentence()],
          isPublished: f.datatype.boolean(0.8),
          isFeatured: f.datatype.boolean(0.2),
          publishedAt: f.datatype.boolean(0.8) ? f.date.past() : null,
          categoryId: category.id,
          tags: {
            connect: courseTags.map((tag) => ({ id: tag.id }))
          }
        }
      })
    })
  )
}

/**
 * Crear módulos y lecciones
 */
async function createModulesAndLessons(courses: any[], files: any[]) {
  const videoFiles = files.filter((f) => f.type === 'video')
  const documentFiles = files.filter((f) => f.type === 'document')

  for (const course of courses) {
    const numModules = f.number.int({ min: 3, max: 8 })

    for (let m = 0; m < numModules; m++) {
      const module = await prisma.module.create({
        data: {
          title: `Módulo ${m + 1}: ${f.lorem.words(3)}`,
          description: f.lorem.paragraph(),
          position: m,
          isPublished: course.isPublished,
          courseId: course.id
        }
      })

      const numLessons = f.number.int({ min: 3, max: 8 })

      for (let l = 0; l < numLessons; l++) {
        const lesson = await prisma.lesson.create({
          data: {
            title: `Lección ${l + 1}: ${f.lorem.words(4)}`,
            description: f.lorem.paragraph(),
            position: l,
            durationMinutes: f.number.int({ min: 10, max: 60 }),
            isFree: m === 0 && l === 0,
            isPublished: module.isPublished,
            moduleId: module.id
          }
        })

        // Crear contenido de la lección
        const numContents = f.number.int({ min: 1, max: 4 })
        for (let c = 0; c < numContents; c++) {
          const contentType = f.helpers.arrayElement([ContentType.TEXT, ContentType.VIDEO_URL, ContentType.CODE])

          await prisma.lessonContent.create({
            data: {
              lessonId: lesson.id,
              type: contentType,
              position: c,
              title: contentType === ContentType.TEXT ? null : f.lorem.words(3),
              content:
                contentType === ContentType.TEXT
                  ? f.lorem.paragraphs(5)
                  : contentType === ContentType.CODE
                    ? '// Código de ejemplo\nfunction ejemplo() {\n  return "Hola Mundo";\n}'
                    : '',
              fileId: contentType === ContentType.VIDEO_URL ? f.helpers.arrayElement(videoFiles)?.id : null,
              metadata: contentType === ContentType.VIDEO_URL ? { provider: 'internal', autoplay: false } : undefined
            }
          })
        }

        // Crear quiz ocasionalmente
        if (f.datatype.boolean(0.3)) {
          const quiz = await prisma.quiz.create({
            data: {
              title: `Quiz: ${lesson.title}`,
              description: 'Evalúa tus conocimientos',
              durationMinutes: f.number.int({ min: 5, max: 30 }),
              passingScore: 70,
              maxAttempts: 3,
              showAnswers: true,
              shuffleQuestions: true,
              lessonId: lesson.id
            }
          })

          // Crear preguntas
          const numQuestions = f.number.int({ min: 3, max: 10 })
          for (let q = 0; q < numQuestions; q++) {
            const questionType = f.helpers.arrayElement([
              QuestionType.MULTIPLE_CHOICE,
              QuestionType.SINGLE_CHOICE,
              QuestionType.TRUE_FALSE
            ])

            const question = await prisma.question.create({
              data: {
                text: `${f.lorem.sentence()}?`,
                explanation: f.lorem.paragraph(),
                type: questionType,
                points: 1,
                position: q,
                quizId: quiz.id
              }
            })

            // Crear opciones de respuesta
            const numOptions = questionType === QuestionType.TRUE_FALSE ? 2 : f.number.int({ min: 3, max: 5 })
            for (let o = 0; o < numOptions; o++) {
              await prisma.answerOption.create({
                data: {
                  text: questionType === QuestionType.TRUE_FALSE ? (o === 0 ? 'Verdadero' : 'Falso') : f.lorem.sentence(),
                  isCorrect: o === 0,
                  position: o,
                  questionId: question.id
                }
              })
            }
          }
        }

        // Crear assignment ocasionalmente
        if (f.datatype.boolean(0.2)) {
          await prisma.assignment.create({
            data: {
              title: `Tarea: ${lesson.title}`,
              description: f.lorem.paragraph(),
              instructions: f.lorem.paragraphs(2),
              maxPoints: 100,
              dueDate: f.date.future(),
              allowLate: f.datatype.boolean(),
              fileRequired: f.datatype.boolean(),
              allowedFormats: ['pdf', 'docx', 'zip'],
              lessonId: lesson.id
            }
          })
        }

        // Crear attachments
        if (f.datatype.boolean(0.4)) {
          await prisma.lessonAttachment.create({
            data: {
              lessonId: lesson.id,
              fileId: f.helpers.arrayElement(documentFiles).id,
              position: 0
            }
          })
        }
      }
    }
  }
}

/**
 * Crear inscripciones
 */
async function createEnrollments(students: any[], courses: any[]) {
  const publishedCourses = courses.filter((c) => c.isPublished)

  for (const student of students) {
    const numEnrollments = f.number.int({ min: 1, max: 5 })
    const studentCourses = f.helpers.arrayElements(publishedCourses, numEnrollments)

    for (const course of studentCourses) {
      const progress = f.number.float({ min: 0, max: 100, multipleOf: 0.1 })
      const isCompleted = progress === 100

      await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          progress,
          lastAccessed: f.date.recent(),
          totalTimeMinutes: f.number.int({ min: 0, max: 3000 }),
          isCompleted,
          completedAt: isCompleted ? f.date.past() : null
        }
      })

      // Crear progreso de lecciones
      const modules = await prisma.module.findMany({
        where: { courseId: course.id },
        include: { lessons: true }
      })

      for (const module of modules) {
        for (const lesson of module.lessons) {
          if (f.datatype.boolean(progress / 100)) {
            await prisma.userLessonProgress.create({
              data: {
                userId: student.id,
                lessonId: lesson.id,
                isCompleted: f.datatype.boolean(0.7),
                timeMinutes: f.number.int({ min: 5, max: 60 }),
                lastPosition: f.number.int({ min: 0, max: 100 })
              }
            })
          }
        }
      }
    }
  }
}

/**
 * Crear reseñas
 */
async function createReviews(students: any[], courses: any[]) {
  const publishedCourses = courses.filter((c) => c.isPublished)

  for (const student of students) {
    if (f.datatype.boolean(0.6)) {
      const course = f.helpers.arrayElement(publishedCourses)

      // Verificar si ya tiene una inscripción
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: course.id
          }
        }
      })

      if (enrollment) {
        await prisma.review.create({
          data: {
            userId: student.id,
            courseId: course.id,
            rating: f.number.int({ min: 3, max: 5 }),
            comment: f.datatype.boolean(0.8) ? f.lorem.paragraph() : null,
            isPublic: f.datatype.boolean(0.9),
            likes: f.number.int({ min: 0, max: 50 })
          }
        })
      }
    }
  }
}

/**
 * Crear sistema de gamificación
 */
async function createGamificationSystem(students: any[], files: any[]) {
  const badgeImages = files.filter((f) => f.folder === 'badges')
  const achievementImages = files.filter((f) => f.folder === 'achievements')
  const rewardImages = files.filter((f) => f.folder === 'rewards')

  // Crear badges
  const badgeNames = [
    'Primera Lección',
    'Aprendiz Rápido',
    'Maestro de Quiz',
    'Racha de 7 días',
    'Racha de 30 días',
    'Completador de Cursos',
    'Estudiante Dedicado',
    'Preguntón',
    'Explorador',
    'Mentor'
  ]

  const badges = await Promise.all(
    badgeNames.map((name, i) =>
      prisma.badge.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description: f.lorem.sentence(),
          imageId: badgeImages[i % badgeImages.length].id,
          criteria: { type: 'completion', target: f.number.int({ min: 1, max: 10 }) },
          rarity: f.helpers.arrayElement(Object.values(BadgeRarity)),
          points: f.number.int({ min: 10, max: 100 }),
          isActive: true
        }
      })
    )
  )

  // Asignar badges a estudiantes
  for (const student of students) {
    const numBadges = f.number.int({ min: 0, max: 5 })
    const studentBadges = f.helpers.arrayElements(badges, numBadges)

    for (const badge of studentBadges) {
      await prisma.userBadge.create({
        data: {
          userId: student.id,
          badgeId: badge.id,
          progress: 100,
          obtainedAt: f.date.past()
        }
      })
    }
  }

  // Crear achievements
  const achievementNames = [
    'Primer Paso',
    'Conocimiento Acumulado',
    'Velocista del Aprendizaje',
    'Perfeccionista',
    'Curioso Incansable',
    'Certificado Pro',
    'Comunidad Activa',
    'Experto en Temas',
    'Maratón de Estudio',
    'Coleccionista'
  ]

  const achievements = await Promise.all(
    achievementNames.map((name, i) =>
      prisma.achievement.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description: f.lorem.paragraph(),
          imageId: achievementImages[i % achievementImages.length].id,
          type: f.helpers.arrayElement(Object.values(AchievementType)),
          criteria: { requirement: f.lorem.sentence() },
          rewardXp: f.number.int({ min: 50, max: 500 }),
          rewardCoins: f.number.int({ min: 10, max: 100 }),
          isSequential: f.datatype.boolean(),
          sequenceOrder: f.datatype.boolean() ? i : null,
          isActive: true
        }
      })
    )
  )

  // Asignar achievements a estudiantes
  for (const student of students) {
    const numAchievements = f.number.int({ min: 0, max: 5 })
    const studentAchievements = f.helpers.arrayElements(achievements, numAchievements)

    for (const achievement of studentAchievements) {
      const completed = f.datatype.boolean(0.7)
      await prisma.userAchievement.create({
        data: {
          userId: student.id,
          achievementId: achievement.id,
          progress: completed ? 100 : f.number.float({ min: 0, max: 99 }),
          completed,
          obtainedAt: completed ? f.date.past() : null
        }
      })
    }
  }

  // Crear rewards
  const rewardNames = [
    'Avatar Épico',
    'Tema Oscuro Premium',
    'Marco de Perfil Dorado',
    'Título: Maestro',
    'Efecto de Partículas',
    'Avatar Legendario',
    'Tema Personalizado',
    'Marco de Perfil Diamante',
    'Título: Experto',
    'Banner Animado'
  ]

  await Promise.all(
    rewardNames.map((name, i) =>
      prisma.reward.create({
        data: {
          name,
          description: f.lorem.sentence(),
          imageId: rewardImages[i % rewardImages.length].id,
          type: f.helpers.arrayElement(Object.values(RewardType)),
          rarity: f.helpers.arrayElement(Object.values(BadgeRarity)),
          coinCost: f.number.int({ min: 100, max: 1000 }),
          stock: f.datatype.boolean(0.7) ? f.number.int({ min: 10, max: 100 }) : null,
          isAvailable: true,
          metadata: { effect: f.lorem.word() }
        }
      })
    )
  )

  // Crear missions
  const missionNames = ['Desafío Diario', 'Semana Intensiva', 'Mes del Conocimiento', 'Evento Especial', 'Competencia Relámpago']

  await Promise.all(
    missionNames.map((name) =>
      prisma.mission.create({
        data: {
          name,
          description: f.lorem.paragraph(),
          imageId: f.helpers.arrayElement(rewardImages).id,
          type: f.helpers.arrayElement(Object.values(MissionType)),
          difficulty: f.helpers.arrayElement(Object.values(MissionDifficulty)),
          objectives: [{ task: f.lorem.sentence(), target: f.number.int({ min: 1, max: 10 }) }],
          rewardXp: f.number.int({ min: 100, max: 1000 }),
          rewardCoins: f.number.int({ min: 50, max: 500 }),
          startDate: f.date.recent(),
          endDate: f.date.future(),
          isRepeatable: f.datatype.boolean(),
          isActive: true
        }
      })
    )
  )

  // Crear XP records
  for (const student of students) {
    const numRecords = f.number.int({ min: 5, max: 20 })
    for (let i = 0; i < numRecords; i++) {
      await prisma.userXpRecord.create({
        data: {
          userId: student.id,
          points: f.number.int({ min: 10, max: 100 }),
          sourceType: f.helpers.arrayElement(Object.values(AchievementSourceType)),
          sourceId: f.string.nanoid(),
          description: f.lorem.sentence(),
          createdAt: f.date.past()
        }
      })
    }
  }
}

/**
 * Crear planes de suscripción
 */
async function createSubscriptionPlans() {
  return Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: 'Plan Básico',
        slug: 'basico',
        description: 'Acceso a cursos básicos',
        price: 99,
        interval: PlanInterval.MONTHLY,
        features: ['Acceso a cursos básicos', 'Certificados de finalización', 'Soporte por email'],
        isActive: true,
        isPopular: false,
        courseLimits: 10
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Plan Pro',
        slug: 'pro',
        description: 'Acceso completo a todos los cursos',
        price: 299,
        interval: PlanInterval.MONTHLY,
        features: [
          'Acceso ilimitado a todos los cursos',
          'Certificados verificados',
          'Soporte prioritario',
          'Descarga de recursos',
          'Acceso offline'
        ],
        isActive: true,
        isPopular: true
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Plan Anual',
        slug: 'anual',
        description: 'Ahorra con el plan anual',
        price: 2499,
        interval: PlanInterval.YEARLY,
        features: ['Todo lo del Plan Pro', '2 meses gratis', 'Acceso anticipado a nuevos cursos', 'Mentorías mensuales'],
        isActive: true,
        isPopular: false
      }
    })
  ])
}

/**
 * Crear suscripciones y pagos
 */
async function createSubscriptionsAndPayments(students: any[], plans: any[], courses: any[]) {
  for (const student of students) {
    // Crear método de pago
    if (f.datatype.boolean(0.7)) {
      const cardHolderName = student.profile?.name || student.email.split('@')[0]
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId: student.id,
          type: f.helpers.arrayElement([PaymentMethodType.CREDIT_CARD, PaymentMethodType.DEBIT_CARD, PaymentMethodType.PAYPAL]),
          provider: f.helpers.arrayElement(['Visa', 'Mastercard', 'PayPal']),
          last4Digits: f.finance.creditCardNumber().slice(-4),
          cardHolderName: cardHolderName,
          expirationDate: '12/25',
          providerToken: f.string.alphanumeric(32),
          isDefault: true,
          isActive: true
        }
      })

      // Crear suscripción ocasionalmente
      if (f.datatype.boolean(0.4)) {
        const plan = f.helpers.arrayElement(plans)
        const subscription = await prisma.subscription.create({
          data: {
            userId: student.id,
            planId: plan.id,
            status: f.helpers.arrayElement([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]),
            startDate: f.date.past(),
            endDate: f.date.future(),
            nextPaymentDate: f.date.future(),
            autoRenew: true,
            paymentMethodId: paymentMethod.id
          }
        })

        // Crear pago de suscripción
        await prisma.payment.create({
          data: {
            userId: student.id,
            amount: plan.price,
            fee: plan.price * 0.03,
            netAmount: plan.price * 0.97,
            currency: 'MXN',
            status: PaymentStatus.COMPLETED,
            type: PaymentType.SUBSCRIPTION,
            paymentMethodId: paymentMethod.id,
            paymentProvider: 'Stripe',
            transactionId: `txn_${f.string.alphanumeric(16)}`,
            description: `Pago de suscripción: ${plan.name}`,
            subscriptionId: subscription.id,
            processedAt: f.date.past()
          }
        })
      }

      // Crear compras de cursos
      if (f.datatype.boolean(0.5)) {
        const course = f.helpers.arrayElement(courses.filter((c) => c.price))

        const payment = await prisma.payment.create({
          data: {
            userId: student.id,
            amount: course.discountPrice || course.price,
            fee: (course.discountPrice || course.price) * 0.03,
            netAmount: (course.discountPrice || course.price) * 0.97,
            currency: 'MXN',
            status: PaymentStatus.COMPLETED,
            type: PaymentType.COURSE_PURCHASE,
            paymentMethodId: paymentMethod.id,
            paymentProvider: 'Stripe',
            transactionId: `txn_${f.string.alphanumeric(16)}`,
            description: `Compra del curso: ${course.title}`,
            processedAt: f.date.past()
          }
        })

        await prisma.purchase.create({
          data: {
            userId: student.id,
            courseId: course.id,
            paymentId: payment.id,
            price: course.discountPrice || course.price,
            originalPrice: course.price,
            discountPercentage: course.discountPrice ? ((course.price - course.discountPrice) / course.price) * 100 : null
          }
        })
      }
    }
  }
}

/**
 * Crear certificados
 */
async function createCertificates(_students: any[], _courses: any[], files: any[]) {
  const templateFiles = files.filter((f) => f.folder === 'certificates')

  // Crear templates
  const templates = await Promise.all(
    templateFiles.map((file) =>
      prisma.certificateTemplate.create({
        data: {
          name: `Plantilla ${file.name}`,
          description: 'Plantilla de certificado profesional',
          fileId: file.id,
          variables: {
            studentName: 'string',
            courseName: 'string',
            date: 'date',
            instructor: 'string'
          },
          isActive: true
        }
      })
    )
  )

  // Asignar certificados a estudiantes que completaron cursos
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { isCompleted: true },
    include: { user: { include: { profile: true } }, course: true }
  })

  for (const enrollment of completedEnrollments) {
    if (f.datatype.boolean(0.8)) {
      await prisma.certificate.create({
        data: {
          code: f.string.alphanumeric(12).toUpperCase(),
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          templateId: f.helpers.arrayElement(templates).id,
          customData: {
            studentName: enrollment.user.profile?.name,
            courseName: enrollment.course.title,
            completionDate: enrollment.completedAt
          },
          issuedAt: enrollment.completedAt || new Date()
        }
      })
    }
  }
}

/**
 * Crear discusiones
 */
async function createDiscussions(students: any[], courses: any[]) {
  const publishedCourses = courses.filter((c) => c.isPublished)

  for (const course of publishedCourses) {
    if (f.datatype.boolean(0.7)) {
      const numThreads = f.number.int({ min: 1, max: 5 })

      for (let i = 0; i < numThreads; i++) {
        const author = f.helpers.arrayElement(students)
        const title = f.lorem.sentence()

        const thread = await prisma.discussionThread.create({
          data: {
            title,
            slug: title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
            description: f.lorem.paragraph(),
            userId: author.id,
            courseId: course.id,
            isClosed: f.datatype.boolean(0.1),
            isPinned: f.datatype.boolean(0.2),
            views: f.number.int({ min: 0, max: 500 })
          }
        })

        // Crear posts en el thread
        const numPosts = f.number.int({ min: 1, max: 10 })
        for (let p = 0; p < numPosts; p++) {
          const postAuthor = f.helpers.arrayElement(students)

          await prisma.discussionPost.create({
            data: {
              content: f.lorem.paragraphs(2),
              userId: postAuthor.id,
              threadId: thread.id,
              likes: f.number.int({ min: 0, max: 50 })
            }
          })
        }
      }
    }
  }
}

/**
 * Crear notificaciones
 */
async function createNotifications(students: any[]) {
  for (const student of students) {
    const numNotifications = f.number.int({ min: 5, max: 15 })

    for (let i = 0; i < numNotifications; i++) {
      const isRead = f.datatype.boolean(0.6)

      await prisma.notification.create({
        data: {
          userId: student.id,
          type: f.helpers.arrayElement(Object.values(NotificationType)),
          title: f.lorem.sentence(),
          message: f.lorem.paragraph(),
          link: f.datatype.boolean(0.5) ? f.internet.url() : null,
          data: { extra: f.lorem.word() },
          isRead,
          readAt: isRead ? f.date.past() : null,
          createdAt: f.date.past()
        }
      })
    }
  }
}

/**
 * Crear anuncios
 */
async function createAnnouncements(courses: any[], files: any[]) {
  const announcementImages = files.filter((f) => f.folder === 'courses').slice(0, 5)

  const announcements = [
    {
      title: '¡Nuevo curso de IA disponible!',
      content: 'Descubre nuestro nuevo curso de Inteligencia Artificial y Machine Learning',
      ctaText: 'Ver curso',
      ctaLink: '/cursos/ia-machine-learning',
      placement: AnnouncementPlacement.DASHBOARD_BANNER,
      targetRole: null
    },
    {
      title: 'Descuento del 50% en todos los cursos',
      content: 'Por tiempo limitado, obtén acceso a nuestros mejores cursos con 50% de descuento',
      ctaText: 'Aprovechar oferta',
      ctaLink: '/cursos',
      placement: AnnouncementPlacement.GLOBAL_MODAL,
      targetRole: UserRole.STUDENT
    },
    {
      title: 'Certificaciones profesionales disponibles',
      content: 'Obtén certificados reconocidos por la industria',
      ctaText: 'Más información',
      ctaLink: '/certificaciones',
      placement: AnnouncementPlacement.INLINE_FEED,
      targetRole: null
    },
    {
      title: 'Webinar gratuito este viernes',
      content: 'Únete a nuestro webinar sobre tendencias en desarrollo web',
      ctaText: 'Registrarse',
      ctaLink: '/eventos/webinar',
      placement: AnnouncementPlacement.DASHBOARD_BANNER,
      targetRole: UserRole.STUDENT
    },
    {
      title: 'Nuevas herramientas para instructores',
      content: 'Descubre las nuevas funcionalidades para crear cursos más interactivos',
      ctaText: 'Explorar',
      ctaLink: '/instructor/herramientas',
      placement: AnnouncementPlacement.COURSE_BANNER,
      targetRole: UserRole.INSTRUCTOR
    }
  ]

  return Promise.all(
    announcements.map((ann, i) =>
      prisma.announcement.create({
        data: {
          ...ann,
          imageId: announcementImages[i]?.id,
          startDate: f.date.recent(),
          endDate: f.date.future(),
          priority: i,
          isActive: true,
          viewCount: f.number.int({ min: 0, max: 1000 }),
          clickCount: f.number.int({ min: 0, max: 200 }),
          targetCourseId: ann.placement === AnnouncementPlacement.COURSE_BANNER ? f.helpers.arrayElement(courses).id : null
        }
      })
    )
  )
}

/**
 * Crear tareas personales y eventos
 */
async function createPersonalTasksAndEvents(students: any[]) {
  for (const student of students) {
    // Crear tareas personales
    const numTasks = f.number.int({ min: 3, max: 10 })
    for (let i = 0; i < numTasks; i++) {
      const status = f.helpers.arrayElement(Object.values(PersonalTaskStatus))

      await prisma.personalTask.create({
        data: {
          userId: student.id,
          title: f.lorem.sentence(),
          description: f.lorem.paragraph(),
          status,
          priority: f.helpers.arrayElement(Object.values(TaskPriority)),
          dueDate: f.datatype.boolean(0.7) ? f.date.future() : null,
          tags: [f.lorem.word(), f.lorem.word()],
          completedAt: status === PersonalTaskStatus.COMPLETED ? f.date.past() : null
        }
      })
    }

    // Crear eventos de calendario
    const numEvents = f.number.int({ min: 2, max: 8 })
    for (let i = 0; i < numEvents; i++) {
      const startDate = f.date.future()
      const endDate = new Date(startDate.getTime() + f.number.int({ min: 1, max: 4 }) * 3600000)

      await prisma.calendarEvent.create({
        data: {
          userId: student.id,
          title: f.lorem.sentence(),
          description: f.lorem.paragraph(),
          startDate,
          endDate,
          allDay: f.datatype.boolean(0.3),
          location: f.datatype.boolean(0.5) ? f.location.city() : null,
          color: f.color.rgb(),
          type: f.helpers.arrayElement(Object.values(EventType)),
          metadata: { source: 'manual' }
        }
      })
    }
  }
}

/**
 * Crear rutas de aprendizaje
 */
async function createLearningPaths(courses: any[], files: any[]) {
  const pathImages = files.filter((f) => f.folder === 'courses').slice(0, 5)

  const paths = [
    {
      title: 'Desarrollador Full Stack Completo',
      slug: 'desarrollador-full-stack-completo',
      description: 'Conviértete en un desarrollador full stack profesional',
      level: CourseLevel.INTERMEDIATE,
      estimatedDurationDays: 180
    },
    {
      title: 'Especialista en Data Science',
      slug: 'especialista-data-science',
      description: 'Domina el análisis de datos y machine learning',
      level: CourseLevel.ADVANCED,
      estimatedDurationDays: 240
    },
    {
      title: 'Diseñador UX/UI Profesional',
      slug: 'disenador-ux-ui-profesional',
      description: 'Aprende diseño de experiencia e interfaz de usuario',
      level: CourseLevel.BEGINNER,
      estimatedDurationDays: 120
    },
    {
      title: 'Marketing Digital Avanzado',
      slug: 'marketing-digital-avanzado',
      description: 'Estrategias avanzadas de marketing digital',
      level: CourseLevel.INTERMEDIATE,
      estimatedDurationDays: 90
    }
  ]

  // Obtener instructores para asignar a las rutas
  const instructors = await prisma.user.findMany({
    where: { role: UserRole.INSTRUCTOR },
    include: { instructorProfile: true }
  })

  if (instructors.length === 0) {
    throw new Error('No instructors found in the database. Please ensure instructors are created before learning paths.')
  }

  for (const [index, pathData] of paths.entries()) {
    const instructor = instructors[index % instructors.length]
    const path = await prisma.learningPath.create({
      data: {
        ...pathData,
        imageId: pathImages[index]?.id,
        instructorId: instructor.id,
        isPublished: true
      }
    })

    // Asignar cursos a la ruta
    const pathCourses = f.helpers.arrayElements(
      courses.filter((c) => c.isPublished),
      f.number.int({ min: 3, max: 6 })
    )

    for (const [i, course] of pathCourses.entries()) {
      await prisma.courseLearningPath.create({
        data: {
          learningPathId: path.id,
          courseId: course.id,
          position: i,
          isOptional: f.datatype.boolean(0.2)
        }
      })
    }
  }
}

// Ejecutar el seed
main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
