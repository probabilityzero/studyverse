'use client'

import * as React from 'react'

interface FileToolbarProps {
  filePath: string
  onSave?: () => Promise<void> | void
  loading?: boolean
  saving?: boolean
  children?: React.ReactNode
  saveVisible?: boolean
}

export function FileToolbar({ filePath, children }: FileToolbarProps) {
  const fileName = filePath.split('/').pop() || filePath

  return (
    <div className="h-10 flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
        <div className="text-sm font-medium flex items-center gap-10">
          {fileName}
        </div>
        <div className="flex items-center gap-2">
        {children}
        </div>
    </div>
  )
}

export default FileToolbar
