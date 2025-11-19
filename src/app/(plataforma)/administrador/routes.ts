import { Activity, BarChart3, BookOpen, Settings, Users } from 'lucide-react'

export default [
  {
    title: 'Resumen',
    url: '/administrador',
    icon: BarChart3,
    isActive: true
  },
  {
    title: 'Usuarios',
    url: '/administrador?tab=users',
    icon: Users
  },
  {
    title: 'Cursos',
    url: '/administrador?tab=courses',
    icon: BookOpen
  },
  {
    title: 'Salud del Sistema',
    url: '/administrador?tab=health',
    icon: Activity
  },
  {
    title: 'Configuración',
    url: '/administrador?tab=settings',
    icon: Settings
  }
] as NavItem[]
