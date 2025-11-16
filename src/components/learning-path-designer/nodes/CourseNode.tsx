'use client'

import { BookOpen } from 'lucide-react'
import type React from 'react'
import { Handle, Position } from 'reactflow'

export const CourseNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div
      className={`flex min-w-[150px] flex-col rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 px-4 py-3 shadow-lg transition-all ${
        selected ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      <div className='mb-2 flex items-center gap-2'>
        <BookOpen className='h-4 w-4 text-white' />
        <div className='text-sm font-bold text-white'>{data.label || 'Curso'}</div>
      </div>
      {data.courseName && <div className='text-xs text-blue-100'>{data.courseName}</div>}
      {data.description && <div className='mt-1 text-xs text-blue-50'>{data.description}</div>}
      {data.isOptional && (
        <div className='mt-2 inline-block rounded bg-blue-800 px-2 py-1 text-xs font-semibold text-white'>Opcional</div>
      )}
      <Handle type='target' position={Position.Top} />
      <Handle type='source' position={Position.Bottom} />
    </div>
  )
}
