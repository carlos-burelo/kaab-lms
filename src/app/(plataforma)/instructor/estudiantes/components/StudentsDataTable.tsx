// app/admin/estudiantes/components/UserDataTable.tsx
'use client'

import { type User, UserRole } from '@prisma/client'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Trash } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { deleteMultipleUsers } from '../actions'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function UserDataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Estado para el modal de eliminación masiva
  const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = React.useState(false)
  const [isBulkDeletePending, startBulkDeleteTransition] = React.useTransition()

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  // --- Manejador de Eliminación Masiva ---
  const onBulkDelete = () => {
    startBulkDeleteTransition(async () => {
      const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as User).id) // Asumimos que TData es User

      const result = await deleteMultipleUsers(selectedIds)
      if (result.success) {
        toast.success(`${selectedIds.length} usuario(s) eliminado(s) correctamente.`)
        table.resetRowSelection() // Limpia la selección
        setBulkDeleteModalOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className='w-full'>
      {/* SECCIÓN DE FILTROS Y ACCIONES MASIVAS */}
      <div className='flex items-center gap-4 py-4'>
        {/* Filtro de Email con Icono */}
        <div className='relative flex-1 md:flex-none'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Filtrar por email...'
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
            className='w-full pl-10 md:w-80' // Padding para el icono
          />
        </div>

        {/* Filtro de Rol */}
        <Select
          value={
            (table.getColumn('rol')?.getFilterValue() as string) ?? 'all' // Valor por defecto
          }
          onValueChange={(value) => table.getColumn('rol')?.setFilterValue(value === 'all' ? '' : value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filtrar por Rol' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'all'}>Todos los roles</SelectItem>
            <SelectItem value={UserRole.STUDENT}>Estudiante</SelectItem>
            <SelectItem value={UserRole.INSTRUCTOR}>Instructor</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón de Columnas (al final) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columnas <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* --- BOTÓN DE ELIMINACIÓN MASIVA --- */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button variant='destructive' size='sm' onClick={() => setBulkDeleteModalOpen(true)} disabled={isBulkDeletePending}>
            <Trash className='mr-2 h-4 w-4' />
            Eliminar ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
      </div>

      {/* TABLA */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN MEJORADA */}
      <div className='flex items-center justify-between space-x-2 py-4'>
        {/* Conteo de seleccionados */}
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>

        {/* Controles de paginación con Tooltips */}
        <div className='flex items-center space-x-4'>
          <div className='text-muted-foreground text-sm'>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <TooltipProvider delayDuration={100}>
            <div className='flex items-center space-x-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-8 p-0'
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className='sr-only'>Ir a primera página</span>
                    <ChevronsLeft className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Primera Página</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-8 p-0'
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className='sr-only'>Ir a página anterior</span>
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Página Anterior</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-8 p-0'
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className='sr-only'>Ir a página siguiente</span>
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Página Siguiente</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-8 p-0'
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className='sr-only'>Ir a última página</span>
                    <ChevronsRight className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Última Página</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* --- MODAL DE ELIMINACIÓN MASIVA --- */}
      <AlertDialog open={isBulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{' '}
              <span className='font-medium'>{table.getFilteredSelectedRowModel().rows.length} usuario(s)</span> de la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeletePending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkDelete} disabled={isBulkDeletePending} className='bg-red-600 hover:bg-red-700'>
              {isBulkDeletePending ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
