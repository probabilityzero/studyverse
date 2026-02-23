'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Settings } from 'lucide-react'
import { FolderPicker } from './SetWorkspaceModal'
import SettingsModal from '@/components/SettingsModal'

export function WorkspaceFooter() {
  const [currentFolder, setCurrentFolder] = useState('')
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const refreshDirectory = () => {
    window.dispatchEvent(new CustomEvent('workspace-refresh'))
  }

  const handleFolderSelect = (folderPath: string) => {
    setCurrentFolder(folderPath)
    window.dispatchEvent(new CustomEvent('workspace-base-dir-changed', { detail: folderPath }))
  }

  const loadCurrentFolder = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/list`)
      if (res.ok) {
        const data = await res.json()
        if (data.currentBaseDir) setCurrentFolder(data.currentBaseDir)
      }
    } catch (err) {
      // noop
    }
  }

  useEffect(() => { loadCurrentFolder() }, [])

  return (
    <div className="h-10 flex items-center justify-between gap-4 px-3 border-t border-border text-foreground/80">
      <FolderPicker onFolderSelect={handleFolderSelect} currentFolder={currentFolder} />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshDirectory}
          disabled={loading}
          className="h-7 w-7 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          disabled={loading}
          className="h-7 w-7 p-0"
        >
          <Settings className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  )
}

export default WorkspaceFooter
