import {
  BadgeCheckIcon,
  BookCopyIcon,
  BookMarkedIcon,
  HomeIcon,
  TrophyIcon,
  AwardIcon,
  TargetIcon,
  GiftIcon,
  UsersIcon,
  StoreIcon,
  RouteIcon,
  UserIcon,
  CheckSquareIcon,
  CalendarIcon,
  MessageSquareIcon,
  BellIcon,
  ListChecksIcon
} from 'lucide-react'

export default [
  {
    title: 'Inicio',
    url: '/estudiante',
    icon: HomeIcon
  },
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
    title: 'Rutas de aprendizaje',
    url: '/estudiante/rutas-aprendizaje',
    icon: RouteIcon
  },
  {
    title: 'Gamificación',
    icon: TrophyIcon,
    url: '/estudiante/gamificacion',
    items: [
      {
        title: 'Dashboard',
        url: '/estudiante/gamificacion'
      },
      {
        title: 'Insignias',
        url: '/estudiante/gamificacion/insignias'
      },
      {
        title: 'Logros',
        url: '/estudiante/gamificacion/logros'
      },
      {
        title: 'Misiones',
        url: '/estudiante/gamificacion/misiones'
      },
      {
        title: 'Clasificación',
        url: '/estudiante/gamificacion/leaderboard'
      },
      {
        title: 'Tienda',
        url: '/estudiante/gamificacion/tienda'
      }
    ]
  },
  {
    title: 'Mis certificados',
    url: '/estudiante/mis-certificados',
    icon: BadgeCheckIcon
  },
  {
    title: 'Evaluaciones',
    url: '/estudiante/evaluaciones',
    icon: ListChecksIcon
  },
  {
    title: 'Tareas',
    url: '/estudiante/tareas',
    icon: CheckSquareIcon
  },
  {
    title: 'Calendario',
    url: '/estudiante/calendario',
    icon: CalendarIcon
  },
  {
    title: 'Mensajes',
    url: '/estudiante/mensajes',
    icon: MessageSquareIcon
  },
  {
    title: 'Notificaciones',
    url: '/estudiante/notificaciones',
    icon: BellIcon
  },
  {
    title: 'Perfil',
    url: '/estudiante/perfil',
    icon: UserIcon
  }
] as NavItem[]
