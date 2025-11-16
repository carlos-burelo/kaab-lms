import type { UserRole } from '@prisma/client'
import { compare } from 'bcryptjs'
import NextAuth, { type Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { cache } from 'react'
import { verifyAccount } from '@/database/contexts/global'
import { redirect } from 'next/navigation'

export type AuthUser = Session['user'] & { id: string }

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        contrasena: { label: 'Password', type: 'password' }
      },
      async authorize({ contrasena, email }): Promise<AuthUser | null> {
        if (!email || !contrasena) return null

        const user = await verifyAccount(email.toString())

        if (!user || !user.password) throw new Error('No user found')

        const isValid = await compare(String(contrasena), String(user.password))

        if (!isValid) return null

        return {
          id: user.id,
          name: user.profile?.name,
          email: user.email,
          imagen: user.profile?.imageUrl ?? null,
          role: user.role
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.rol = user.role
      return token as { rol: UserRole }
    },
    async session({ session, token }) {
      const rol = token.rol as UserRole
      if (token?.rol && token.sub) session.user = { ...session.user, role: rol, id: token.sub }
      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
})

export const getSession = cache(async () => {
  const session = await auth()
  if (!session || !session.user) {
    redirect('/sign-in')
     
  }
  return session!.user as Required<AuthUser>
})
