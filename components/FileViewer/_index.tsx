'use client';

import { useState, useEffect, useRef } from 'react';
import { MarkdownEditor } from './Markdown';
import { HTMLEditor } from './HTML';
import { PDFViewer } from './PDF';
import { FolderViewer } from './Folder';

interface FileEditorProps {
  filePath: string | null;
  onClose: () => void;
  onSave?: (path: string, content: string) => Promise<void>;
  onOpenFile?: (path: string) => void;
}

export function FileEditor({ filePath, onClose, onSave, onOpenFile }: FileEditorProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
    }
  }, [filePath]);

  const loadFile = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/file?path=${encodeURIComponent(path)}`);
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setContent(data.content);
          setOriginalContent(data.content);
        }
      } else {
        const text = await response.text();
        setContent(text);
        setOriginalContent(text);
      }
    } catch (error) {
      setError('Failed to load file: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!filePath) return;
    
    setSaving(true);
    setError(null);
    try {
      if (onSave) {
        await onSave(filePath, content);
      } else {
        const response = await fetch(`${apiUrl}/api/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: filePath, content }),
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            setOriginalContent(content);
          }
        } else if (!response.ok) {
          const text = await response.text();
          setError(text || 'Save failed');
        } else {
          setOriginalContent(content);
        }
      }
    } catch (error) {
      setError('Failed to save file: ' + String(error));
    } finally {
      setSaving(false);
    }
  };

  // Auto-save: debounce changes and save automatically for regular editable files
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!filePath) return;
    if (loading || saving) return;
    if (filePath.startsWith('dir:')) return; // folders
    const ext = (filePath.split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') return; // don't auto-save binary viewers

    if (content === originalContent) return; // nothing to save

    // debounce
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      handleSave();
    }, 1500);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [content, filePath, loading, saving, originalContent]);

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a file to open
      </div>
    );
  }

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div className="h-full flex flex-col bg-background">
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading file...</div>
      ) : (
        <>
          <div className="flex-1">
            {filePath && filePath.startsWith('dir:') ? (
              <div className="h-full"><FolderViewer folderPath={filePath.replace(/^dir:/, '')} apiUrl={apiUrl} onOpenFile={(p) => { onOpenFile && onOpenFile(p); }} /></div>
            ) : (() => {
              const ext = (filePath.split('.').pop() || '').toLowerCase();
              if (ext === 'md' || ext === 'markdown') {
                return <MarkdownEditor filePath={filePath} content={content} setContent={setContent} onSave={handleSave} loading={loading} saving={saving} />;
              }
              if (ext === 'html' || ext === 'htm') {
                return <HTMLEditor filePath={filePath} content={content} setContent={setContent} onSave={handleSave} loading={loading} saving={saving} apiUrl={apiUrl} />
              }
              if (ext === 'pdf') {
                return <PDFViewer filePath={filePath} apiUrl={apiUrl} />;
              }
              return (
                <div className="h-full flex flex-col">
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 p-4 font-mono text-sm bg-background text-foreground border-0 focus:outline-none resize-none" placeholder="Start typing..." spellCheck="false" />
                </div>
              );
            })()
            }
          </div>
        </>
      )}
      {error && <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-b border-border">{error}</div>}
    </div>
  );
}
