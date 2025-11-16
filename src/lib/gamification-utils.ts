/**
 * Utilidades para la integración de gamificación con otras partes del sistema
 */

/**
 * Calcula XP base según el tipo de fuente
 */
export function calculateXpFromSource(sourceType: string, difficulty?: string): number {
  switch (sourceType) {
    case 'LESSON_COMPLETED':
      return 50
    case 'MODULE_COMPLETED':
      return 100
    case 'COURSE_COMPLETED':
      return 300
    case 'QUIZ_PASSED':
      // Quiz difficulty multiplies base XP
      switch (difficulty) {
        case 'hard':
          return 150
        case 'medium':
          return 100
        case 'easy':
          return 50
        default:
          return 75
      }
    case 'ASSIGNMENT_SUBMITTED':
      return 75
    case 'ASSIGNMENT_GRADED':
      // Based on grade
      return 100
    case 'DISCUSSION_POST':
      return 10
    case 'REVIEW_POSTED':
      return 25
    case 'BADGE_EARNED':
      return 0 // Already awarded with badge
    case 'ACHIEVEMENT_COMPLETED':
      return 0 // Already awarded with achievement
    case 'MISSION_COMPLETED':
      return 0 // Handled separately
    default:
      return 0
  }
}

/**
 * Determina si se debe completar un logro automáticamente
 */
export function shouldAutoCompleteAchievement(achievementType: string, currentValue: number): boolean {
  const thresholds: Record<string, number> = {
    LESSONS_COMPLETED_1: 1,
    LESSONS_COMPLETED_10: 10,
    LESSONS_COMPLETED_50: 50,
    LESSONS_COMPLETED_100: 100,
    COURSES_COMPLETED_1: 1,
    COURSES_COMPLETED_5: 5,
    XP_EARNED_100: 100,
    XP_EARNED_1000: 1000,
    XP_EARNED_5000: 5000,
    LEVEL_REACHED_5: 5,
    LEVEL_REACHED_10: 10,
    LEVEL_REACHED_20: 20
  }

  const threshold = thresholds[achievementType]
  return currentValue >= threshold
}

/**
 * Obtiene sugerencias de badges a otorgar basado en progreso
 */
export function suggestBadgesForCompletion(sourceType: string, courseLevel?: string): string[] {
  const suggestions: string[] = []

  if (sourceType === 'LESSON_COMPLETED') {
    suggestions.push('FIRST_LESSON_BADGE')
  }

  if (sourceType === 'COURSE_COMPLETED') {
    suggestions.push('COURSE_MASTER_BADGE')

    if (courseLevel === 'ADVANCED') {
      suggestions.push('ADVANCED_COURSE_BADGE')
    }
  }

  if (sourceType === 'QUIZ_PASSED') {
    suggestions.push('QUIZ_MASTER_BADGE')
  }

  return suggestions
}

/**
 * Genera mensaje de notificación para logro desbloqueado
 */
export function generateAchievementMessage(achievementName: string, xpReward: number, coinReward?: number): string {
  let message = `¡Felicidades! Desbloqueaste el logro "${achievementName}" y obtuviste +${xpReward} XP`

  if (coinReward && coinReward > 0) {
    message += ` y +${coinReward} coins`
  }

  return message
}

/**
 * Genera mensaje de notificación para nuevo nivel
 */
export function generateLevelUpMessage(newLevel: number): string {
  const messages = [
    `¡Subiste a nivel ${newLevel}! ¡Sigue así!`,
    `Felicidades, ahora eres nivel ${newLevel}. ¡Cada vez más fuerte!`,
    `¡Nivel ${newLevel} alcanzado! Vas muy bien en tu aprendizaje.`,
    `¡Wow! ¡Llegaste a nivel ${newLevel}! El camino es largo, pero lo estás haciendo bien.`
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Determina el color para mostrar un nivel
 */
export function getLevelColor(level: number): string {
  if (level >= 50) return 'from-gold to-yellow-500'
  if (level >= 30) return 'from-purple-500 to-pink-500'
  if (level >= 20) return 'from-blue-500 to-cyan-500'
  if (level >= 10) return 'from-green-500 to-emerald-500'
  return 'from-gray-500 to-gray-600'
}

/**
 * Obtiene descripción de rareza de badge
 */
export function getRarityDescription(rarity: string): string {
  const descriptions: Record<string, string> = {
    common: 'Insígnia común - Fácil de obtener',
    uncommon: 'Insígnia poco común - Requiere algo de esfuerzo',
    rare: 'Insígnia rara - Desafío considerable',
    epic: 'Insígnia épica - Muy difícil de obtener',
    legendary: 'Insígnia legendaria - Extremadamente rara'
  }

  return descriptions[rarity] || 'Insígnia'
}
