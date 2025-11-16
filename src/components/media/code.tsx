'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying code:', err)
    }
  }

  return (
    <div className='rounded-lg border border-muted overflow-hidden bg-muted/30'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-muted'>
        <span className='text-xs font-semibold text-muted-foreground uppercase'>{language}</span>
        <Button size='sm' variant='ghost' onClick={handleCopy} className='h-6 px-2 text-xs gap-1'>
          {copied ? (
            <>
              <Check className='w-3 h-3' />
              Copiado
            </>
          ) : (
            <>
              <Copy className='w-3 h-3' />
              Copiar
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <pre className='p-4 font-mono text-sm text-foreground overflow-x-auto max-h-96'>
        <code>{code}</code>
      </pre>
    </div>
  )
}
