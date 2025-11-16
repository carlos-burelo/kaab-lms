'use client'

import type React from 'react'
import { Handle, Position } from 'reactflow'

export const EndNode: React.FC<any> = ({ data }) => {
  return (
    <div className='flex min-w-[120px] flex-col items-center rounded-full bg-gradient-to-br from-red-400 to-red-600 px-4 py-3 text-center shadow-lg'>
      <div className='text-sm font-bold text-white'>Fin</div>
      {data.label && <div className='text-xs text-red-100'>{data.label}</div>}
      <Handle type='target' position={Position.Top} />
    </div>
  )
}
