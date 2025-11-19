import { toast as sonnerToast } from 'sonner'

export type ToastActionElement = React.ReactElement

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', ...props }: Omit<Toast, 'id'>) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title || description || '', {
        description: title ? description : undefined,
        ...props
      })
    }

    return sonnerToast.success(title || description || '', {
      description: title ? description : undefined,
      ...props
    })
  }

  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId)
  }
}
