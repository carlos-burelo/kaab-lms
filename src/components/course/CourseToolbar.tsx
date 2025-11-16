'use client'

import type { Category, CourseLevel, Tag } from '@prisma/client'
import {
  ArrowUpDown,
  LayoutGridIcon, // Icono para Categoría
  Search,
  Signal, // Icono para Nivel
  SlidersHorizontal
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { CourseToggleView } from './CourseToggleView'

export interface CourseFilters {
  search: string
  categoria: string
  nivel: string
  priceRange: [number, number]
  calificacion: number
  etiquetas: string[]
  sortBy: string
}

interface CourseToolbarProps {
  filters: CourseFilters
  onFiltersChange: (filters: Partial<CourseFilters>) => void
  onClearFilters: () => void
  availableCategories: Category[]
  availableLevels: CourseLevel[]
  availableTags: Tag[]
  viewMode: 'grid' | 'list'
  onViewModeChange: (viewMode: 'grid' | 'list') => void
}

export function CourseToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  availableLevels,
  availableTags,
  onViewModeChange,
  viewMode
}: CourseToolbarProps) {
  const activeFiltersCount = [
    filters.categoria !== 'all' ? 1 : 0,
    filters.nivel !== 'all' ? 1 : 0,
    filters.calificacion > 0 ? 1 : 0,
    filters.etiquetas.length > 0 ? 1 : 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 200 ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  const toggleTag = (tagId: string) => {
    const isSelected = filters.etiquetas.includes(tagId)
    onFiltersChange({
      etiquetas: isSelected ? filters.etiquetas.filter((id) => id !== tagId) : [...filters.etiquetas, tagId]
    })
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
        <div className='relative w-full'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar cursos...'
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className='text-base w-full pl-10 pr-4'
            autoFocus
          />
        </div>
        <div className='flex items-center gap-2'>
          <Select value={filters.categoria} onValueChange={(value) => onFiltersChange({ categoria: value })}>
            <SelectTrigger className='sm:w-[150px]'>
              <LayoutGridIcon className='h-4 w-4 sm:mr-2' />
              <span className='hidden sm:inline-block'>Categoría</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos</SelectItem>
              {availableCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.nivel} onValueChange={(value) => onFiltersChange({ nivel: value })}>
            <SelectTrigger className='sm:w-[130px]'>
              <Signal className='h-4 w-4 sm:mr-2' />
              <span className='hidden sm:inline-block'>Nivel</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos</SelectItem>
              {availableLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ sortBy: value })}>
            <SelectTrigger className='sm:w-[140px]'>
              <ArrowUpDown className='h-4 w-4 sm:mr-2' />
              <span className='hidden sm:inline-block'>Ordenar</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='popular'>Más Popular</SelectItem>
              <SelectItem value='rating'>Mejor calificados</SelectItem>
              <SelectItem value='newest'>Nuevos</SelectItem>
              <SelectItem value='price-low'>Precio: Menor a mayor</SelectItem>
              <SelectItem value='price-high'>Precio: Mayor a menor</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' className='relative px-3 sm:px-4'>
                <SlidersHorizontal className='h-4 w-4 sm:mr-2' />
                <span className='hidden sm:inline-block'>Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge className='absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'>
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros avanzados</SheetTitle>
                <SheetDescription>Refina tu búsqueda de cursos con filtros detallados</SheetDescription>
              </SheetHeader>

              <div className='space-y-6 px-4 py-6'>
                <div>
                  <Label className='text-base font-medium mb-3 block'>
                    Rango de precio: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
                    max={200}
                    step={10}
                    className='w-full'
                  />
                </div>

                <div>
                  <Label className='text-base font-medium mb-3 block'>Calificación minima</Label>
                  <Select
                    value={filters.calificacion.toString()}
                    onValueChange={(value) => onFiltersChange({ calificacion: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Any rating' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Cualquier calificación</SelectItem>
                      <SelectItem value='4'>4+ ⭐</SelectItem>
                      <SelectItem value='4.5'>4.5+ ⭐</SelectItem>
                      <SelectItem value='4.8'>4.8+ ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className='text-base font-medium mb-3 block'>Etiquetas</Label>
                  <ScrollArea className='h-48'>
                    <div className='space-y-2'>
                      {availableTags.map((tag) => (
                        <div key={tag.id} className='flex items-center space-x-2'>
                          <Checkbox
                            id={tag.id}
                            checked={filters.etiquetas.includes(tag.id)}
                            onCheckedChange={() => toggleTag(tag.id)}
                          />
                          <Label htmlFor={tag.id} className='text-sm font-normal'>
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button variant='default' onClick={onClearFilters} className='w-full'>
                  Limpiar todos los filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <CourseToggleView viewMode={viewMode} onViewModeChange={onViewModeChange} />
          {/* --- FIN: Filtros Responsivos --- */}
        </div>
      </div>
    </div>
  )
}
