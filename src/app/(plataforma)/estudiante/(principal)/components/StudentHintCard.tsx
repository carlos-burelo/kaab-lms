interface StudentHintCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

export function StudentHintCard({ icon, label, value }: StudentHintCardProps) {
  return (
    <div className='p-2 lg:p-4 border border-muted-foreground/20 rounded-lg'>
      <div className='flex items-start gap-4'>
        <span className='text-primary'>{icon}</span>
        <div className='overflow-hidden'>
          <p className='text-xl font-semibold leading-5'>{value}</p>
          <p className='text-sm text-muted-foreground truncate line-clamp-1 overflow-ellipsis'>{label}</p>
        </div>
      </div>
    </div>
  )
}
