// lib/schemas.ts (Archivo Nuevo)
import { z } from 'zod'

// Esquema para el formulario de edición de usuario
export const updateUserSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Debe ser un email válido.'),
  // Número con validación
  xp: z.number().min(0, 'El XP no puede ser negativo.')
})

export type UpdateUserForm = z.infer<typeof updateUserSchema>
