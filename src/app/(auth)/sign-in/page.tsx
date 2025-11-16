import SignInButton from '@/components/auth/SignInButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SignInPage() {
  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <form className='grid gap-4'>
          <div className='flex flex-col items-center gap-2'>
            <div className='flex text-3xl items-center justify-center rounded-md'>🐝</div>
            <h1 className='text-xl font-bold'>KaabLMS</h1>
            <div className='text-center text-sm'>
              Olvidaste tu contraseña?{' '}
              <a href='/forgot-password' className='underline underline-offset-4'>
                Recuperar
              </a>
            </div>
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='email'>Email</Label>
            <Input name='email' type='email' placeholder='m@example.com' required />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='contrasena'>Contraseña</Label>
            <Input name='contrasena' type='password' placeholder='********' required />
          </div>
          <SignInButton>Iniciar sesión</SignInButton>
        </form>
      </div>
    </div>
  )
}
