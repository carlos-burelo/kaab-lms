import { TabsList as TabListComponent, TabsTrigger } from '@/components/ui/tabs'

interface TabsListProps {
  items: Array<{
    value: string
    label: string
  }>
}

export function TabsList({ items }: TabsListProps) {
  return (
    <TabListComponent className={`grid w-full grid-cols-3 gap-2 bg-background`}>
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          className='border-border data-[state=active]:shadow-none data-[state=active]:bg-muted'
          value={item.value}
        >
          {item.label}
        </TabsTrigger>
      ))}
    </TabListComponent>
  )
}
