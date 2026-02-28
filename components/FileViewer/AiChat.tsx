'use client'

import React, { useEffect, useRef, useState } from 'react'

interface AiChatProps {
  open: boolean
  onClose: () => void
  filePath?: string
}

export default function AiChat({ open, onClose, filePath }: AiChatProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ sx: 0, sy: 0, px: 0, py: 0 })
  const [minimized, setMinimized] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedEdit, setSuggestedEdit] = useState<null | { type: string; content: string }>(null)

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
          <div className="flex-1 overflow-auto text-sm space-y-2">
            {messages.length === 0 && <div className="text-muted-foreground">Start a conversation about this file.</div>}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-2 py-1 rounded ${m.role === 'user' ? 'bg-primary/10' : 'bg-muted/20'}`}>{m.content}</div>
              </div>
            ))}
            {suggestedEdit && (
              <div className="mt-2 p-2 border border-border rounded bg-background">
                <div className="text-sm font-medium mb-1">Suggested edit ({suggestedEdit.type})</div>
                <pre className="max-h-40 overflow-auto text-xs bg-surface p-2 rounded">{suggestedEdit.content}</pre>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1 rounded bg-primary text-primary-foreground" onClick={async () => {
                    if (!filePath) return alert('No file path');
                    try {
                      const res = await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: filePath, content: suggestedEdit.content }) })
                      const data = await res.json()
                      if (data.error) alert('Save failed: ' + data.error)
                      else alert('Applied suggested edit')
                    } catch (e) { alert('Save failed: ' + String(e)) }
                  }}>Apply</button>
                  <button className="px-3 py-1 rounded" onClick={() => setSuggestedEdit(null)}>Dismiss</button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 px-2 py-1 border border-border rounded" placeholder="Ask something..." onKeyDown={async (e) => { if (e.key === 'Enter') { e.preventDefault(); await sendMessage(); } }} />
            <button disabled={loading} onClick={() => sendMessage()} className="px-3 py-1 rounded bg-primary text-primary-foreground">{loading ? '...' : 'Send'}</button>
          </div>
        </div>
      )}
    </div>
  )

  async function sendMessage() {
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input.trim() }
    setMessages((m) => [...m, userMessage])
    setInput('')
    setLoading(true)
    setSuggestedEdit(null)
    try {
      const resp = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: filePath || '/', messages: [userMessage] }) })
      const data = await resp.json()
      if (data.error) {
        setMessages((m) => [...m, { role: 'assistant', content: 'Error: ' + (data.error || 'unknown') }])
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || String(data) }])
        if (data.suggestedEdit) setSuggestedEdit(data.suggestedEdit)
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error: ' + String(e) }])
    } finally {
      setLoading(false)
    }
  }
}
