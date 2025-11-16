import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface AvatarGroupProps {
  users: any[]
}

export function AvatarGroup({ users }: AvatarGroupProps) {
  return (
    <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2'>
      {users.map((user) => (
        <Avatar key={user.id} className='size-5'>
          <AvatarImage className='size-5' src={user.imagenUrl} alt={user.nombre} />
          <AvatarFallback>{user.nombre.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}
