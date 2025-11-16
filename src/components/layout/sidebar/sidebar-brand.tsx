import Link from 'next/link'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

interface SidebarBrandProps {
  prefix?: string
}

export default function SidebarBrand({ prefix = '/' }: SidebarBrandProps) {
  return (
    <SidebarMenu className='h-12 py-0! grid items-center'>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild>
          <Link href={prefix} className='flex items-center gap-2'>
            <div className='bg-accent border border-muted-foreground/20 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              🐝
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>ACME INC.</span>
              <span className='truncate text-xs'>v1.0.0</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
