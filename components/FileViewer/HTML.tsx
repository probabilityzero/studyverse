'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="h-full flex flex-col">
      <div className="h-10 flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
        <div className="text-sm font-medium">{filePath.split('/').pop()}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPreviewMode((p) => !p)}>{previewMode ? 'Editor' : 'Preview'}</Button>
          <Button size="sm" onClick={onSave} disabled={saving || loading}>Save</Button>
        </div>
      </div>
      <div className="flex-1 flex">
        {previewMode ? (
          <iframe srcDoc={content} className="flex-1 border-0" title="html-preview" />
        ) : (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 p-4 font-mono text-sm bg-background text-foreground border-0 focus:outline-none" />
        )}
      </div>
    </div>
  );
}
