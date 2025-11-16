import { redirect } from 'next/navigation'
import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout'
import { ThemeProvider } from '@/components/layout/theme/theme-provider'
import { getSession } from '@/lib/auth'
import { getNavigationByRole, getPrefixByRole } from './router'
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect('/sign-in')
  }
  const navigation = getNavigationByRole(session.role)
  const prefix = getPrefixByRole(session.role)

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
      <SidebarLayout user={session} items={navigation} prefix={prefix}>
        <div className='grid p-0'>{children}</div>
      </SidebarLayout>
    </ThemeProvider>
  )
}
