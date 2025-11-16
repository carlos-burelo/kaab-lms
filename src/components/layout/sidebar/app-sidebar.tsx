import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import SidebarBrand from './sidebar-brand'
import { SidebarNavList } from './sidebar-nav-list'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  items: NavItem[]
  prefix?: string
}

export function AppSidebar({ items, prefix, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='h-14'>
        <SidebarBrand prefix={prefix} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavList items={items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
