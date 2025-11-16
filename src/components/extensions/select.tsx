import { Select as SelectComponent, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface SelectProps {
  name: string
  className?: string
  options: { value: string; label: string }[]
  defaultValue?: string
  required?: boolean
}

export function Select({ name, className, options, defaultValue, required }: SelectProps) {
  return (
    <SelectComponent name={name} defaultValue={defaultValue} required={required}>
      <SelectTrigger className={className}>
        <SelectValue placeholder='Selecciona una opción' />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectComponent>
  )
}
