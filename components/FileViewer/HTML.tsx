'use client';

import { useState } from 'react';
import FileToolbar, { ViewModeToggle, AiChatControl } from './_toolbar'
import AiChat from './AiChat'
import { useEffect, useRef } from 'react'

interface HTMLEditorProps {
  filePath: string;
  content: string;
  setContent: (c: string) => void;
  onSave: () => Promise<void>;
  loading?: boolean;
  saving?: boolean;
  apiUrl?: string;
}

export function HTMLEditor({ filePath, content, setContent, onSave, loading, saving }: HTMLEditorProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'editor' | 'both'>('preview');
  const [chatOpen, setChatOpen] = useState(false);

  const originalRef = useRef<string>(content);

  useEffect(() => {
    originalRef.current = content
  }, [filePath])

  return (
    <div className="h-full flex flex-col bg-background">
      <FileToolbar filePath={filePath} onSave={onSave} loading={loading} saving={saving}>
        <ViewModeToggle value={viewMode} onChange={(v) => setViewMode(v)} />
        <AiChatControl onClick={() => setChatOpen(true)} />
      </FileToolbar>

      <div className="flex-1 flex">
        {viewMode === 'preview' && (
          <iframe srcDoc={content} className="flex-1 border-0" title="html-preview" />
        )}
        {viewMode === 'editor' && (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 w-full h-full p-4 font-mono text-sm bg-background text-foreground border-0 focus:outline-none" />
        )}
        {viewMode === 'both' && (
          <div className="flex-1 flex border-0">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-1/2 h-full p-4 font-mono text-sm bg-background text-foreground border-r border-border focus:outline-none" />
            <iframe srcDoc={content} className="w-1/2 border-0" title="html-preview" />
          </div>
        )}
      </div>

      <AiChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
