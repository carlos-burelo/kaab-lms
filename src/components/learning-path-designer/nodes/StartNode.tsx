'use client'

import type React from 'react'
import { Handle, Position } from 'reactflow'

export const StartNode: React.FC<any> = ({ data }) => {
  return (
    <div className='flex min-w-[120px] flex-col items-center rounded-full bg-gradient-to-br from-green-400 to-green-600 px-4 py-3 text-center shadow-lg'>
      <div className='text-sm font-bold text-white'>Inicio</div>
      {data.label && <div className='text-xs text-green-100'>{data.label}</div>}
      <Handle type='source' position={Position.Bottom} />
    </div>
  )
}
