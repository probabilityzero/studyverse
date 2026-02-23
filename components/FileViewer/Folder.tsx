'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FolderViewerProps {
  folderPath: string;
  apiUrl?: string;
  onOpenFile?: (path: string) => void;
}

export function FolderViewer({ folderPath, apiUrl, onOpenFile }: FolderViewerProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${base}/api/list?dir=${encodeURIComponent(folderPath)}`);
        if (!res.ok) {
          const t = await res.text().catch(() => res.statusText);
          throw new Error(`${res.status} ${res.statusText} - ${t}`);
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const t = await res.text();
          throw new Error(`Unexpected response from server: ${t}`);
        }
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setFiles(data.files || []);
        }
      } catch (err: any) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [folderPath, apiUrl]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-auto p-4">
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !error && (
          <div className="grid gap-2">
            {files.map((f) => (
              <div key={f.path} className="flex items-center justify-between gap-2 p-2 border rounded">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-muted-foreground">{f.type}</div>
                </div>
                <div className="flex gap-2">
                  {f.type === 'file' ? (
                    <Button size="sm" onClick={() => onOpenFile && onOpenFile(f.path)}>Open</Button>
                  ) : (
                    <Button size="sm" onClick={() => onOpenFile && onOpenFile(`dir:${f.path}`)}>Open</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
