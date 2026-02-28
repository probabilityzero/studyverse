'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

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
type ControlProps = {
  onClick: () => void
  label?: string
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: string
  className?: string
}

export function TogglePreviewControl({ onClick, label, active, size, variant, className }: ControlProps & { label?: string }) {
  return (
    <div>
      <Button size={'sm'} variant={variant as any} className={active ? (className ? className : 'bg-primary/10') : className} onClick={onClick}>
        {label}
      </Button>
    </div>
  )
}

export function ViewEditorControl({ onClick, label = 'Editor', active, size, variant, className }: ControlProps & { label?: string }) {
  return (
    <div>
      <Button size={'sm'} variant={variant as any} className={active ? (className ? className : 'bg-primary/10') : className} onClick={onClick}>{label}</Button>
    </div>
  )
}

export function ViewPreviewControl({ onClick, label = 'Preview', active, size, variant, className }: ControlProps & { label?: string }) {
  return (
    <div>
      <Button size={'sm'} variant={variant as any} className={active ? (className ? className : 'bg-primary/10') : className} onClick={onClick}>{label}</Button>
    </div>
  )
}

export function ViewBothControl({ onClick, label = 'Both', active, size, variant, className }: ControlProps & { label?: string }) {
  return (
    <div>
      <Button size={'sm'} variant={variant as any} className={active ? (className ? className : 'bg-primary/10') : className} onClick={onClick}>{label}</Button>
    </div>
  )
}

export function AiChatControl({ onClick, label = 'AI Chat', size, variant, className }: ControlProps & { label?: string }) {
  return (
    <div>
      <Button size={'sm'} variant={variant as any} className={className} onClick={onClick}>{label}</Button>
    </div>
  )
}

// Combined view-mode toggle: Editor / Preview / Both
export function ViewModeToggle({ value, onChange }: { value: 'editor' | 'preview' | 'both'; onChange: (v: 'editor' | 'preview' | 'both') => void }) {
  const base = 'inline-flex items-center rounded bg-muted/40';
  const item = 'flex h-9 w-9 items-center justify-center text-sm first:rounded-l last:rounded-r hover:bg-muted/60';

  return (
    <div className={base} role="tablist" aria-label="View mode toggle">
      <button className={`${item} ${value === 'editor' ? 'bg-primary/10' : ''}`} onClick={() => onChange('editor')} aria-pressed={value === 'editor'}>E</button>
      <button className={`${item} ${value === 'preview' ? 'bg-primary/10' : ''}`} onClick={() => onChange('preview')} aria-pressed={value === 'preview'}>P</button>
      <button className={`${item} ${value === 'both' ? 'bg-primary/10' : ''}`} onClick={() => onChange('both')} aria-pressed={value === 'both'}>B</button>
    </div>
  )
}
