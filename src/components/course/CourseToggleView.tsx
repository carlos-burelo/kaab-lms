import { Grid3X3, List } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface CourseToggleViewProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (viewMode: 'grid' | 'list') => void
}

export function CourseToggleView({ viewMode, onViewModeChange }: CourseToggleViewProps) {
  return (
    <ToggleGroup
      type='single'
      variant='outline'
      value={viewMode}
      onValueChange={(value) => value && onViewModeChange(value as 'grid' | 'list')}
    >
      <ToggleGroupItem value='grid' aria-label='Grid view'>
        <Grid3X3 className='h-4 w-4' />
      </ToggleGroupItem>
      <ToggleGroupItem value='list' aria-label='List view'>
        <List className='h-4 w-4' />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
