'use client';

import { useState } from 'react';
import FileToolbar from './_toolbar'
import { Button } from '@/components/ui/button'

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
  const [previewMode, setPreviewMode] = useState(true);

  return (
    <div className="h-full flex flex-col bg-background">
      <FileToolbar filePath={filePath} onSave={onSave} loading={loading} saving={saving}>
        <Button size="sm" variant="outline" onClick={() => setPreviewMode((p) => !p)}>{previewMode ? 'Editor' : 'Preview'}</Button>
      </FileToolbar>

      <div className="flex-1 flex">
        {previewMode ? (
          <iframe srcDoc={content} className="flex-1 border-0" title="html-preview" />
        ) : (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 w-full h-full p-4 font-mono text-sm bg-background text-foreground border-0 focus:outline-none" />
        )}
      </div>
    </div>
  );
}
