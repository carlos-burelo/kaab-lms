import type { Session } from 'next-auth'
import { SidebarAccount } from '@/components/layout/sidebar/sidebar-account'
import { ModeSwitcher } from '@/components/layout/theme/mode-switcher'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface SidebarHeaderProps {
  user: Session['user']
}

export default function SidebarHeader({ user }: SidebarHeaderProps) {
  return (
    <header
      className='flex justify-between items-center h-14 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 border-b
    backdrop-blur bg-background/80 px-4 sticky top-0 z-30
    '
    >
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
      </div>
      <div className='flex items-center gap-2'>
        <ModeSwitcher />
        <SidebarAccount user={user} />
      </div>
    </header>
  )
}
