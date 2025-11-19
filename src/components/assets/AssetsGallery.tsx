'use client'

import {
  AlertCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileIcon,
  Film,
  FolderOpen,
  ImageIcon,
  Loader2,
  Music,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { deleteFile, getUploadedFiles, searchFiles, toggleFilePublic } from '@/actions/file.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface File {
  id: string
  name: string
  originalName: string
  url: string
  type: string
  mimeType: string
  sizeInBytes: bigint
  width?: number | null
  height?: number | null
  isPublic: boolean
  createdAt: Date
  folder?: string | null
}

interface FilesResponse {
  files: File[]
  total: number
  limit: number
  offset: number
}

interface AssetsGalleryProps {
  initialFiles: FilesResponse
  initialTypes: string[]
}

export function AssetsGallery({ initialFiles, initialTypes }: AssetsGalleryProps) {
  const [isPending, startTransition] = useTransition()
  const [files, setFiles] = useState<File[]>(initialFiles.files)
  const [total, setTotal] = useState(initialFiles.total)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [offset, setOffset] = useState(0)
  const limit = 50
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleLoadMore = () => {
    startTransition(async () => {
      setError(null)
      const result = await getUploadedFiles({
        offset: offset + limit,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        type: selectedType === 'all' ? undefined : selectedType,
        search: searchQuery || undefined
      })

      if (result.success && result.data) {
        setFiles([...files, ...result.data.files])
        setTotal(result.data.total)
        setOffset(offset + limit)
      } else {
        setError(result.error || 'Failed to load files')
      }
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setOffset(0)

    if (!query.trim()) {
      startTransition(async () => {
        const result = await getUploadedFiles({
          offset: 0,
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          type: selectedType === 'all' ? undefined : selectedType
        })

        if (result.success && result.data) {
          setFiles(result.data.files)
          setTotal(result.data.total)
        }
      })
      return
    }

    startTransition(async () => {
      const result = await searchFiles(query)

      if (result.success && result.data) {
        setFiles(result.data)
        setTotal(result.data.length)
      } else {
        setError(result.error || 'Search failed')
      }
    })
  }

  const handleFilterType = (type: string) => {
    setSelectedType(type)
    setOffset(0)
    setSearchQuery('')

    startTransition(async () => {
      setError(null)
      const result = await getUploadedFiles({
        offset: 0,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        type: type === 'all' ? undefined : type
      })

      if (result.success && result.data) {
        setFiles(result.data.files)
        setTotal(result.data.total)
      } else {
        setError(result.error || 'Failed to load files')
      }
    })
  }

  const handleDelete = (fileId: string) => {
    startTransition(async () => {
      const result = await deleteFile(fileId)

      if (result.success) {
        setFiles(files.filter((f) => f.id !== fileId))
        setTotal(total - 1)
        setSuccess('File deleted successfully')
        setDeleteConfirm(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Failed to delete file')
      }
    })
  }

  const handleTogglePublic = (fileId: string, currentState: boolean) => {
    startTransition(async () => {
      const result = await toggleFilePublic(fileId, !currentState)

      if (result.success && result.data) {
        setFiles(files.map((f) => (f.id === fileId ? { ...f, isPublic: !currentState } : f)))
        setSuccess(`File is now ${!currentState ? 'public' : 'private'}`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Failed to update file')
      }
    })
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setSuccess('URL copied to clipboard')
    setTimeout(() => setSuccess(null), 2000)
  }

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return <ImageIcon className='h-5 w-5' />
    if (type.startsWith('video')) return <Film className='h-5 w-5' />
    if (type.startsWith('audio')) return <Music className='h-5 w-5' />
    return <FileIcon className='h-5 w-5' />
  }

  const formatFileSize = (bytes: bigint) => {
    const num = Number(bytes)
    if (num === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(num) / Math.log(k))
    return `${Math.round((num / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isImage = (type: string) => type.startsWith('image')

  return (
    <div className='space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FolderOpen className='h-5 w-5' />
            Assets & Files
          </CardTitle>
          <CardDescription>Browse and manage your uploaded files</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex gap-4 flex-col sm:flex-row'>
            <Input
              placeholder='Search files...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={isPending}
              className='flex-1'
            />

            <Select value={selectedType} onValueChange={handleFilterType} disabled={isPending}>
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {initialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {files.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <FolderOpen className='h-12 w-12 text-muted-foreground mb-3' />
              <p className='text-muted-foreground'>
                {searchQuery || selectedType !== 'all' ? 'No files found' : 'No files uploaded yet'}
              </p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {files.map((file) => (
                  <div
                    key={file.id}
                    className='group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-shadow'
                  >
                    {isImage(file.type) && (
                      <div className='relative w-full aspect-video bg-muted'>
                        <Image
                          src={file.url}
                          alt={file.originalName}
                          fill
                          className='object-cover'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    <div className={`${isImage(file.type) ? '' : 'pt-4'} p-4 space-y-3`}>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            {getFileIcon(file.type)}
                            <h3 className='font-medium text-sm truncate'>{file.originalName}</h3>
                          </div>
                          <p className='text-xs text-muted-foreground'>{formatFileSize(file.sizeInBytes)}</p>
                          <p className='text-xs text-muted-foreground'>{formatDate(file.createdAt)}</p>
                        </div>
                        {file.isPublic && (
                          <Badge variant='secondary' className='ml-auto'>
                            Public
                          </Badge>
                        )}
                      </div>

                      <div className='flex gap-1 flex-wrap pt-2'>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0'
                          onClick={() => handleTogglePublic(file.id, file.isPublic)}
                          disabled={isPending}
                          title={file.isPublic ? 'Make private' : 'Make public'}
                        >
                          {file.isPublic ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0'
                          onClick={() => handleCopyUrl(file.url)}
                          disabled={isPending}
                          title='Copy URL'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0'
                          onClick={() => handleDownload(file.url, file.originalName)}
                          disabled={isPending}
                          title='Download'
                        >
                          <Download className='h-4 w-4' />
                        </Button>

                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                          onClick={() => setDeleteConfirm(file.id)}
                          disabled={isPending}
                          title='Delete'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {offset + limit < total && (
                <div className='flex justify-center pt-4'>
                  <Button onClick={handleLoadMore} disabled={isPending} variant='outline'>
                    {isPending && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                    Load More ({offset + limit} of {total})
                  </Button>
                </div>
              )}

              <p className='text-sm text-muted-foreground text-center'>
                Showing {files.length} of {total} files
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex gap-3'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isPending && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
