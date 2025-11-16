'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { signIn } from '@/actions/signInAction'
import { Button } from '@/components/ui/button'
export default function SignInButton({ children }: { children: React.ReactNode }) {
  const [pending, startTransition] = useTransition()

  async function handleLogin(formData: FormData) {
    startTransition(async () => {
      const error = await signIn(formData)
      if (error) toast.error(error)
    })
  }

  return (
    <Button type='submit' disabled={pending} formAction={handleLogin}>
      {pending ? 'Entrando...' : children}
    </Button>
  )
}
