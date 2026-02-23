'use client';

import { useEffect, useState } from 'react';

interface PDFViewerProps {
  filePath: string;
  apiUrl?: string;
}

export function PDFViewer({ filePath, apiUrl }: PDFViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let url: string | null = null;

    const fetchPdf = async () => {
      if (!apiUrl) {
        setError('API URL not configured');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/api/raw?path=${encodeURIComponent(filePath)}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const buffer = await res.arrayBuffer();
        const blob = new Blob([buffer], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
        if (mounted) setBlobUrl(url);
      } catch (err: any) {
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      mounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [filePath, apiUrl]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        {loading && <div className="p-4 text-sm text-muted-foreground">Loading PDF...</div>}
        {error && <div className="p-4 text-sm text-destructive">{error}</div>}
        {!loading && !error && blobUrl && <iframe src={blobUrl} className="w-full h-full border-0" title="pdf-viewer" />}
      </div>
    </div>
  )
}
