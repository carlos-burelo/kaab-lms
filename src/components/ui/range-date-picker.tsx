'use client'

import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface RangeDatePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RangeDatePicker({
  value,
  onChange,
  label = 'Rango de fechas',
  placeholder = 'Selecciona rango',
  disabled = false,
  className
}: RangeDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    onChange?.(range)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return placeholder

    if (dateRange.to) {
      return `${dateRange.from.toLocaleDateString('es-ES')} - ${dateRange.to.toLocaleDateString('es-ES')}`
    }

    return dateRange.from.toLocaleDateString('es-ES')
  }

  return (
    <div className='flex flex-col gap-3'>
      {label && <Label className='px-1'>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' disabled={disabled} className={cn('w-full justify-between font-normal', className)}>
            {formatDateRange()}
            <ChevronDown className='h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='range'
            selected={dateRange}
            onSelect={handleDateRangeChange}
            captionLayout='dropdown'
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
