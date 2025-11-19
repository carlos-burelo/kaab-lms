'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react'
import { getMyPurchases, getRevenueStats } from '@/actions/instructor/revenue.actions'

type Purchase = {
  id: string
  price: number
  createdAt: Date
  user: { profile: { name: string } }
  course: { title: string }
  payment: { status: string }
}

type RevenueStats = {
  totalRevenue: number
  totalPurchases: number
  revenueByMonth: Array<{ month: string; total: number }>
}

export default function RevenuePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [purchasesResult, statsResult] = await Promise.all([
      getMyPurchases({}),
      getRevenueStats({})
    ])

    if (purchasesResult.success && purchasesResult.data) {
      setPurchases(purchasesResult.data as any)
    }

    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data as any)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className='p-4'>Cargando datos de ingresos...</div>
  }

  return (
    <>
      <header className='border-b border-border p-4'>
        <h1 className='text-2xl font-bold text-foreground'>Ingresos y Pagos</h1>
        <p className='text-sm text-muted-foreground'>
          Gestiona tus ingresos y revisa el historial de transacciones
        </p>
      </header>
      <main className='p-4 space-y-6'>
        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Ingresos Totales</CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${stats?.totalRevenue.toFixed(2)} MXN
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total de Ventas</CardTitle>
              <ShoppingCart className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.totalPurchases || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Promedio por Venta</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                $
                {stats?.totalPurchases
                  ? (stats.totalRevenue / stats.totalPurchases).toFixed(2)
                  : '0.00'}{' '}
                MXN
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Compras</CardTitle>
            <CardDescription>Todas las compras de tus cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center text-muted-foreground'>
                        No hay compras registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          {format(new Date(purchase.createdAt), 'dd/MM/yyyy', {
                            locale: es
                          })}
                        </TableCell>
                        <TableCell>{purchase.user.profile.name}</TableCell>
                        <TableCell>{purchase.course.title}</TableCell>
                        <TableCell>${Number(purchase.price).toFixed(2)} MXN</TableCell>
                        <TableCell>
                          <span className='text-green-600'>{purchase.payment.status}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
