import type { Session } from 'next-auth'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import SidebarHeader from './sidebar-header'

interface SidebarLayoutProps {
  children: React.ReactNode
  items: NavItem[]
  user: Session['user']
  prefix?: string
}

export function SidebarLayout({ children, items, user, prefix }: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar items={items} prefix={prefix} />
      <SidebarInset>
        <SidebarHeader user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
