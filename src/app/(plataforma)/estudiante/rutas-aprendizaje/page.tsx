import type { Metadata } from 'next'
import { getAvailableLearningPaths, getMyLearningPathsInProgress } from '@/actions/learning-path.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Rutas de Aprendizaje',
  description: 'Explora y sigue tus rutas de aprendizaje personalizadas'
}

export default async function LearningPathsPage() {
  const availableResult = await getAvailableLearningPaths()
  const inProgressResult = await getMyLearningPathsInProgress()

  const availablePaths = availableResult.success && availableResult.data ? availableResult.data : []
  const pathsInProgress = inProgressResult.success && inProgressResult.data ? inProgressResult.data : []

  // Get IDs of paths already started
  const startedPathIds = pathsInProgress.map((p: any) => p.learningPathId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rutas de Aprendizaje</h1>
        <p className="text-muted-foreground">
          Sigue rutas de aprendizaje personalizadas diseñadas para tu progreso educativo
        </p>
      </div>

      {/* En Progreso */}
      {pathsInProgress.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            En Progreso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathsInProgress.map((progress: any) => (
              <Card key={progress.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{progress.learningPath?.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {progress.learningPath?.description}
                      </CardDescription>
                    </div>
                    <Badge variant="default">En Progreso</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">
                        {progress.completedNodes?.length || 0} / {progress.learningPath?.nodes?.length || 0}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((progress.completedNodes?.length || 0) / (progress.learningPath?.nodes?.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {progress.learningPath?.instructor?.profile && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Instructor</p>
                      <p className="font-medium">{progress.learningPath.instructor.profile.name}</p>
                    </div>
                  )}

                  <Link href={`/estudiante/rutas-aprendizaje/${progress.learningPathId}`}>
                    <Button className="w-full">
                      Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Disponibles */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Rutas Disponibles</h2>
        {availablePaths.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No hay rutas de aprendizaje disponibles en este momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePaths
              .filter((path: any) => !startedPathIds.includes(path.id))
              .map((path: any) => (
                <Card key={path.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{path.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-2">
                      <div>
                        <p className="text-muted-foreground">Nodos</p>
                        <p className="font-medium">{path.nodes?.length || 0} actividades</p>
                      </div>

                      {path.instructor?.profile && (
                        <div>
                          <p className="text-muted-foreground">Instructor</p>
                          <p className="font-medium">{path.instructor.profile.name}</p>
                        </div>
                      )}

                      {path._count?.progress !== undefined && (
                        <div>
                          <p className="text-muted-foreground">Estudiantes</p>
                          <p className="font-medium">{path._count.progress} en progreso</p>
                        </div>
                      )}
                    </div>

                    <Link href={`/estudiante/rutas-aprendizaje/${path.id}`}>
                      <Button className="w-full" variant="outline">
                        Ver Ruta
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
