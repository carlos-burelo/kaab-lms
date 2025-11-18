"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { idSchema } from "@/actions/_shared/validators"
import { prisma } from "@/database/client"
import { ok, err } from "@/core/shared/result"

// ============ SCHEMAS ============

const getThreadsSchema = z.object({
  courseId: idSchema
})

const createThreadSchema = z.object({
  courseId: idSchema,
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional()
})

const createPostSchema = z.object({
  threadId: idSchema,
  content: z.string().min(1, "El contenido no puede estar vacío"),
  parentId: z.string().optional()
})

// ============ GET DISCUSSION THREADS ============

/**
 * Obtiene todos los hilos de discusión de un curso
 */
export const getDiscussionThreads = createAction({
  name: "student.getDiscussionThreads",
  schema: getThreadsSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT", "INSTRUCTOR"],
  execute: async (input) => {
    try {
      const threads = await prisma.discussionThread.findMany({
        where: { courseId: input.courseId },
        include: {
          user: {
            include: { profile: true }
          },
          _count: {
            select: { posts: true }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' }
        ]
      })

      return ok(threads || [])
    } catch (error) {
      return err(new Error("Error al obtener hilos de discusión"))
    }
  }
})

// ============ GET THREAD WITH POSTS ============

/**
 * Obtiene un hilo con todos sus posts
 */
export const getThreadWithPosts = createAction({
  name: "student.getThreadWithPosts",
  schema: z.object({ threadId: idSchema }),
  requireAuth: true,
  allowedRoles: ["STUDENT", "INSTRUCTOR"],
  execute: async (input) => {
    try {
      const thread = await prisma.discussionThread.findUnique({
        where: { id: input.threadId },
        include: {
          user: {
            include: { profile: true }
          },
          posts: {
            where: { parentId: null },
            include: {
              user: {
                include: { profile: true }
              },
              replies: {
                include: {
                  user: {
                    include: { profile: true }
                  }
                },
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!thread) {
        return err(new Error("Hilo no encontrado"))
      }

      // Increment views
      await prisma.discussionThread.update({
        where: { id: input.threadId },
        data: { views: { increment: 1 } }
      })

      return ok(thread)
    } catch (error) {
      return err(new Error("Error al obtener hilo de discusión"))
    }
  }
})

// ============ CREATE THREAD ============

/**
 * Crea un nuevo hilo de discusión
 */
export const createDiscussionThread = createAction({
  name: "student.createDiscussionThread",
  schema: createThreadSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT", "INSTRUCTOR"],
  execute: async (input, context) => {
    try {
      const slug = input.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const thread = await prisma.discussionThread.create({
        data: {
          title: input.title,
          slug: `${slug}-${Date.now()}`,
          description: input.description,
          userId: context.userId,
          courseId: input.courseId
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      })

      return ok(thread)
    } catch (error) {
      return err(new Error("Error al crear hilo de discusión"))
    }
  }
})

// ============ CREATE POST ============

/**
 * Crea un post en un hilo de discusión
 */
export const createDiscussionPost = createAction({
  name: "student.createDiscussionPost",
  schema: createPostSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT", "INSTRUCTOR"],
  execute: async (input, context) => {
    try {
      const post = await prisma.discussionPost.create({
        data: {
          content: input.content,
          userId: context.userId,
          threadId: input.threadId,
          parentId: input.parentId || null,
          isReply: !!input.parentId
        },
        include: {
          user: {
            include: { profile: true }
          }
        }
      })

      // Update thread's updatedAt
      await prisma.discussionThread.update({
        where: { id: input.threadId },
        data: { updatedAt: new Date() }
      })

      return ok(post)
    } catch (error) {
      return err(new Error("Error al crear post"))
    }
  }
})
