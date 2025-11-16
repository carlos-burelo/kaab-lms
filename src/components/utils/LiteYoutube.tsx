'use client'

import React from 'react'
import '@justinribeiro/lite-youtube'

export default function LiteYouTubeWrapper({ videoId }: { videoId: string }) {
  return React.createElement('lite-youtube', { videoid: videoId, className: 'rounded-lg' })
}
