import { BadgeCheckIcon, BookCopyIcon, BookMarkedIcon } from 'lucide-react'

export default [
  {
    title: 'Cursos',
    url: '/estudiante/cursos',
    icon: BookMarkedIcon,
    isActive: true
  },
  {
    title: 'Mis cursos',
    url: '/estudiante/mis-cursos',
    icon: BookCopyIcon
  },
  {
    title: 'Mis certificados',
    url: '/estudiante/mis-certificados',
    icon: BadgeCheckIcon
  }
] as NavItem[]
