'use client'

import React, { useEffect, useRef, useState } from 'react'

interface AiChatProps {
  open: boolean
  onClose: () => void
}

export default function AiChat({ open, onClose }: AiChatProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ sx: 0, sy: 0, px: 0, py: 0 })
  const [minimized, setMinimized] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return
      const dx = e.clientX - dragStart.current.sx
      const dy = e.clientY - dragStart.current.sy
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
    }
    function onUp() {
      setDragging(false)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  if (!open) return null

  const startDrag = (e: React.MouseEvent) => {
    if (pinned) return
    setDragging(true)
    dragStart.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }
  }

  const panelStyle: React.CSSProperties = pinned
    ? { position: 'fixed', right: 0, top: 80, width: 380, height: minimized ? 40 : 420, zIndex: 60 }
    : { position: 'fixed', left: pos.x, top: pos.y, width: 380, height: minimized ? 40 : 420, zIndex: 60 }

  return (
    <div ref={panelRef} style={panelStyle} className="bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      <div ref={headerRef} onMouseDown={startDrag} className="h-10 flex items-center justify-between px-3 bg-muted/60 cursor-move">
        <div className="text-sm font-medium">AI Chat</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMinimized((m) => !m)} className="text-sm px-2">{minimized ? 'Restore' : 'Min'}</button>
          <button onClick={() => setPinned((p) => !p)} className="text-sm px-2">{pinned ? 'Unpin' : 'Pin'}</button>
          <button onClick={onClose} className="text-sm px-2">Close</button>
        </div>
      </div>
      {!minimized && (
        <div className="p-3 h-[calc(100%-40px)] flex flex-col">
          <div className="flex-1 overflow-auto text-sm">This is a simple AI chat panel placeholder. Connect your AI backend here.</div>
          <div className="mt-2 flex gap-2">
            <input className="flex-1 px-2 py-1 border border-border rounded" placeholder="Ask something..." />
            <button className="px-3 py-1 bg-primary text-white rounded">Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
