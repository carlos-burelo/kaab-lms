/**
 * Tipings Centralizados de KAAB
 * Exporta todos los tipos de la aplicación desde un único punto
 */

// ============================================================================
// LEARNING PATH DESIGNER
// ============================================================================

import type { NodeType } from '@prisma/client'

export type Position = {
  x: number
  y: number
}

export type NodeData = {
  courseId?: string
  courseName?: string
  condition?: string
  description?: string
  isOptional?: boolean
  [key: string]: unknown
}

export type DesignerNode = {
  id: string
  type: NodeType
  title: string
  description?: string
  position: Position
  data: NodeData
  isOptional: boolean
}

export type DesignerEdge = {
  id: string
  source: string
  target: string
  label?: string
  condition?: string
}

export type LearningPathDesignerState = {
  nodes: DesignerNode[]
  edges: DesignerEdge[]
  selectedNodeId?: string
  selectedEdgeId?: string
  isDragging: boolean
  zoomLevel: number
  panX: number
  panY: number
}

export type NodeTypeConfig = {
  type: NodeType
  label: string
  color: string
  icon: string
  description: string
  allowIncoming?: boolean
  allowOutgoing?: boolean
  maxConnections?: number
}

// ============================================================================
// QUIZ
// ============================================================================

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'SINGLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'ORDERING'
  | 'MATCHING'

export interface AnswerOption {
  id: string
  text: string
  isCorrect: boolean
  position: number
  questionId: string
}

export interface Question {
  id: string
  text: string
  explanation?: string
  type: QuestionType
  points: number
  position: number
  fileId?: string
  quizId: string
  options: AnswerOption[]
  createdAt: Date
  updatedAt: Date
}

export interface Quiz {
  id: string
  title: string
  description?: string
  instructions?: string
  durationMinutes?: number
  passingScore: number
  maxAttempts?: number
  showAnswers: boolean
  shuffleQuestions: boolean
  lessonId: string
  questions: Question[]
  attempts: UserQuizAttempt[]
  createdAt: Date
  updatedAt: Date
}

export interface UserAnswer {
  id: string
  attemptId: string
  questionId: string
  selectedOptionId?: string
  answerText?: string
  isCorrect: boolean
  points: number
  createdAt: Date
}

export interface UserQuizAttempt {
  id: string
  userId: string
  quizId: string
  score: number
  maxScore: number
  passed: boolean
  attemptNumber: number
  userAnswers: UserAnswer[]
  startedAt: Date
  completedAt?: Date
}

export interface QuizQuestion {
  id: string
  text: string
  explanation?: string
  type: QuestionType
  points: number
  position: number
  options: {
    id: string
    text: string
    position: number
  }[]
}

export interface QuizResult {
  id: string
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  attemptNumber: number
  completedAt: Date
  questions: {
    id: string
    text: string
    userAnswer?: string
    correctAnswer?: string
    explanation?: string
    points: number
    earnedPoints: number
  }[]
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface AuthUser {
  id: string
  name?: string | null
  email: string
  imagen?: string | null
  role: string
}

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'

// ============================================================================
// COMMON
// ============================================================================

export interface TimestampedEntity {
  createdAt: Date
  updatedAt: Date
}

export interface WithId {
  id: string
}

export type EntityWithTimestamp<T> = T & TimestampedEntity & WithId
