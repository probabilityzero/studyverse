'use client'

import { Button } from '@/components/ui/button'

interface ViewerHeaderProps {
  filePath: string
  onSave?: () => Promise<void> | void
  previewMode?: boolean
  setPreviewMode?: (v: boolean) => void
  loading?: boolean
  saving?: boolean
}

export function ViewerHeader({ filePath, onSave, previewMode, setPreviewMode, loading, saving }: ViewerHeaderProps) {
  const fileName = filePath.split('/').pop() || filePath

  return (
    <div className="h-10 flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
      <div className="text-sm font-medium">{fileName}</div>
      <div className="flex gap-2">
        {setPreviewMode && (
          <Button size="sm" variant="outline" onClick={() => setPreviewMode(!previewMode)}>{previewMode ? 'Editor' : 'Preview'}</Button>
        )}
        {onSave && (
          <Button size="sm" variant="ghost" onClick={onSave} disabled={Boolean(saving) || Boolean(loading)}>Save</Button>
        )}
      </div>
    </div>
  )
}

export default ViewerHeader
