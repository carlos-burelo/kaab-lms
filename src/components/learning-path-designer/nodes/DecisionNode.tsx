'use client'

import { GitBranch } from 'lucide-react'
import type React from 'react'
import { Handle, Position } from 'reactflow'

export const DecisionNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div
      className={`relative flex h-[100px] w-[120px] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg transition-all ${
        selected ? 'ring-2 ring-yellow-400' : ''
      }`}
      style={{
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
      }}
    >
      <div className='flex flex-col items-center gap-1 text-center'>
        <GitBranch className='h-4 w-4 text-white' />
        <div className='text-xs font-bold text-white'>{data.label || 'Decisión'}</div>
      </div>
      <Handle type='target' position={Position.Top} />
      <Handle type='source' position={Position.Bottom} id='true' />
      <Handle type='source' position={Position.Right} id='false' />
    </div>
  )
}
