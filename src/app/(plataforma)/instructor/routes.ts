import { AwardIcon, BarChart3, BookMarkedIcon, Calendar, FolderOpen, GitBranch, UsersIcon } from 'lucide-react'

export default [
  {
    title: 'Cursos',
    url: '/instructor/cursos',
    icon: BookMarkedIcon,
    isActive: true
  },
  {
    title: 'Rutas de Aprendizaje',
    url: '/instructor/rutas-aprendizaje',
    icon: GitBranch
  },
  {
    title: 'Enrollments',
    url: '/instructor/enrollments',
    icon: BarChart3
  },
  {
    title: 'Calendar',
    url: '/instructor/calendar',
    icon: Calendar
  },
  {
    title: 'Estudiantes',
    url: '/instructor/estudiantes',
    icon: UsersIcon
  },
  {
    title: 'Assets',
    url: '/instructor/assets',
    icon: FolderOpen
  },
  {
    title: 'Certificados',
    url: '/instructor/certificados',
    icon: AwardIcon
  }
] as NavItem[]
