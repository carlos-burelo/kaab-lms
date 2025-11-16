'use client'

interface LevelBadgeProps {
  level: number
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showXp?: boolean
}

const sizes = {
  sm: 'w-12 h-12 text-xs',
  md: 'w-16 h-16 text-sm',
  lg: 'w-20 h-20 text-base'
}

export function LevelBadge({ level, xp, size = 'md', showXp = false }: LevelBadgeProps) {
  return (
    <div className='text-center'>
      <div
        className={`
          ${sizes[size]} rounded-full bg-gradient-to-br from-purple-500 to-pink-500
          flex items-center justify-center font-bold text-white shadow-lg
          mx-auto flex-shrink-0
        `}
      >
        <div>
          <div className='text-lg font-bold'>Lv</div>
          <div className='text-base'>{level}</div>
        </div>
      </div>
      {showXp && <p className='text-xs text-gray-500 mt-1'>{xp.toLocaleString()} XP</p>}
    </div>
  )
}
