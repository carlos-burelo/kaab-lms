import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    role: UserRole
  }

  interface Session {
    user: {
      name?: string | null
      imagen: string | null
      email?: string | null
      role: UserRole
      id: string | null
    }
  }

  interface JWT {
    role: UserRole
  }
}

declare global {
  export interface NavItem {
    title: string
    url: string
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
    isActive?: boolean
    items?: NavItem[]
  }

  namespace JSX {
    interface IntrinsicElements {
      'lite-youtube': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        videoid?: string
      }
    }
  }

  type ViewMode = 'grid' | 'list'

  type PrismaResult<T extends (...args: unknown[]) => unknown> = NonNullable<Awaited<ReturnType<T>>>
}
