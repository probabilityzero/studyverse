'use client'

import * as React from 'react'

type TargetType = 'explorer' | 'file' | 'dir' | null

export default function ContextMenu() {
  const [visible, setVisible] = React.useState(false)
  const [x, setX] = React.useState(0)
  const [y, setY] = React.useState(0)
  const [targetType, setTargetType] = React.useState<TargetType>(null)
  const [targetPath, setTargetPath] = React.useState<string>('')

  React.useEffect(() => {
    const onContext = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return

      const node = el.closest('[data-context]') as HTMLElement | null
      let ctx: TargetType = null
      let path = ''
      if (node) {
        ctx = (node.dataset.context as TargetType) || null
        path = node.dataset.path || ''
      }

      e.preventDefault()
      setTargetType(ctx)
      setTargetPath(path)
      setX(e.clientX)
      setY(e.clientY)
      setVisible(true)
    }

    const onClick = () => setVisible(false)

    document.addEventListener('contextmenu', onContext)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('click', onClick)
    }
  }, [])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const dispatchAndClose = (detail: any) => {
    window.dispatchEvent(new CustomEvent('cm-action', { detail }))
    setVisible(false)
  }

  const handleCreate = async (type: 'file' | 'folder') => {
    const name = window.prompt(`Enter ${type} name`)?.trim()
    if (!name) return
    const getParent = (p: string) => {
      if (!p) return '/'
      const parts = p.split('/').filter(Boolean)
      if (parts.length <= 1) return '/'
      return '/' + parts.slice(0, -1).join('/')
    }

    const folder = targetType === 'dir' || targetType === 'explorer'
      ? (targetPath || '/')
      : (targetType === 'file' ? getParent(targetPath) : '/')
    const normalizedFolder = folder === '/' ? '' : folder
    const path = `${normalizedFolder}/${name}`.replace(/\/+/g, '/')

    // dispatch event so Explorer can create inline
    window.dispatchEvent(new CustomEvent('workspace-create', { detail: { type, parent: folder } }))
    setVisible(false)
  }

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(targetPath || '')
    } catch (err) {
      console.error('Copy failed', err)
    }
    setVisible(false)
  }

  const handleDelete = async () => {
    if (!targetPath) return
    if (!confirm(`Delete ${targetPath}? This cannot be undone.`)) return
    try {
      const res = await fetch(`${apiUrl}/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: targetPath }),
      })
      if (!res.ok) throw new Error('Delete failed')
      window.dispatchEvent(new CustomEvent('workspace-refresh'))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('workspace-delete', { detail: targetPath }))
    } finally {
      setVisible(false)
    }
  }

  const handleRename = async () => {
    if (!targetPath) return
    window.dispatchEvent(new CustomEvent('workspace-rename', { detail: { path: targetPath } }))
    setVisible(false)
  }

  if (!visible) return null

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 9999,
    background: 'var(--background)',
    border: '1px solid var(--border)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
    padding: 6,
    borderRadius: 6,
    minWidth: 160,
  }

  return (
    <div style={menuStyle} onContextMenu={(e) => e.preventDefault()}>
      {targetType === 'explorer' && (
        <div className="flex flex-col">
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => handleCreate('file')}>New File</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => handleCreate('folder')}>New Folder</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => { window.dispatchEvent(new CustomEvent('workspace-refresh')); setVisible(false); }}>Refresh</button>
        </div>
      )}

      {targetType === 'dir' && (
        <div className="flex flex-col">
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => dispatchAndClose({ action: 'open', path: targetPath })}>Open</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => handleCreate('file')}>New File</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => handleCreate('folder')}>New Folder</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={handleDelete}>Delete</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={handleCopyPath}>Copy Path</button>
        </div>
      )}

      {targetType === 'file' && (
        <div className="flex flex-col">
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={() => dispatchAndClose({ action: 'open', path: targetPath })}>Open</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={handleRename}>Rename</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={handleDelete}>Delete</button>
          <button className="px-3 py-1 text-sm text-left hover:bg-accent rounded" onClick={handleCopyPath}>Copy Path</button>
        </div>
      )}
    </div>
  )
}
