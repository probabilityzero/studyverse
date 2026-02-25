'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

interface FileToolbarProps {
  filePath: string
  onSave?: () => Promise<void> | void
  loading?: boolean
  saving?: boolean
  children?: React.ReactNode
}

export function FileToolbar({ filePath, onSave, loading, saving, children }: FileToolbarProps) {
  const fileName = filePath.split('/').pop() || filePath

  return (
    <div className="h-10 flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
      <div className="text-sm font-medium">{fileName}</div>
      <div className="flex gap-2">
        {children}
        {onSave && (
          <Button size="sm" onClick={onSave} disabled={Boolean(saving) || Boolean(loading)}>Save</Button>
        )}
      </div>
    </div>
  )
}

export default FileToolbar
