'use client';

import { useEffect, useState } from 'react';

interface Props {
  filePath: string;
  apiUrl?: string;
}

export function FileInlinePreview({ filePath, apiUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const ext = (filePath.split('.').pop() || '').toLowerCase();
        const textTypes = new Set(['md','markdown','txt','js','ts','json','py','java','c','cpp','html','htm','css','csv','mdown']);
        if (!textTypes.has(ext)) {
          if (mounted) setPreview(null);
          return;
        }

        const base = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${base}/api/file?path=${encodeURIComponent(filePath)}`);
        if (!res.ok) {
          const t = await res.text().catch(() => res.statusText);
          throw new Error(`${res.status} ${res.statusText} - ${t}`);
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const t = await res.text();
          throw new Error(`Unexpected response when fetching file preview: ${t}`);
        }
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          const lines = (data.content || '').split(/\r?\n/).slice(0, 10).join('\n');
          if (mounted) setPreview(lines);
        }
      } catch (err: any) {
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [filePath, apiUrl]);

  if (loading) return <div className="p-2 text-sm text-muted-foreground">Loading preview...</div>;
  if (error) return <div className="p-2 text-sm text-destructive">{error}</div>;
  return (
    <pre className="p-2 text-sm bg-muted rounded text-foreground whitespace-pre-wrap">{preview}</pre>
  );
}
