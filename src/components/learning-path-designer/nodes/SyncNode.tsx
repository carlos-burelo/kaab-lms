'use client'

import { GitMerge } from 'lucide-react'
import type React from 'react'
import { Handle, Position } from 'reactflow'

export const SyncNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div
      className={`flex min-w-[140px] flex-col items-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 px-4 py-3 shadow-lg transition-all ${
        selected ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      <div className='mb-1 flex items-center gap-2'>
        <GitMerge className='h-4 w-4 text-white' />
        <div className='text-sm font-bold text-white'>{data.label || 'Sincronizar'}</div>
      </div>
      {data.description && <div className='text-xs text-orange-100'>{data.description}</div>}
      <Handle type='target' position={Position.Top} />
      <Handle type='target' position={Position.Left} />
      <Handle type='source' position={Position.Bottom} />
    </div>
  )
}
