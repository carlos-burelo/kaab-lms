import {
  AwardIcon,
  BarChart3,
  Bell,
  BookMarkedIcon,
  Calendar,
  DollarSign,
  FolderOpen,
  GitBranch,
  Megaphone,
  MessageSquare,
  Star,
  User,
  UsersIcon
} from 'lucide-react'

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
    title: 'Estudiantes',
    url: '/instructor/estudiantes',
    icon: UsersIcon
  },
  {
    title: 'Enrollments',
    url: '/instructor/enrollments',
    icon: BarChart3
  },
  {
    title: 'Anuncios',
    url: '/instructor/anuncios',
    icon: Megaphone
  },
  {
    title: 'Foros',
    url: '/instructor/foros',
    icon: MessageSquare
  },
  {
    title: 'Mensajes',
    url: '/instructor/mensajes',
    icon: MessageSquare
  },
  {
    title: 'Reviews',
    url: '/instructor/reviews',
    icon: Star
  },
  {
    title: 'Ingresos',
    url: '/instructor/ingresos',
    icon: DollarSign
  },
  {
    title: 'Notificaciones',
    url: '/instructor/notificaciones',
    icon: Bell
  },
  {
    title: 'Perfil',
    url: '/instructor/perfil',
    icon: User
  },
  {
    title: 'Calendar',
    url: '/instructor/calendar',
    icon: Calendar
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
