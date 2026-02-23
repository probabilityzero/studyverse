'use client';

interface MarkdownEditorProps {
  filePath: string;
  content: string;
  setContent: (c: string) => void;
  onSave: () => Promise<void>;
  loading?: boolean;
  saving?: boolean;
  previewMode?: boolean;
  setPreviewMode?: (v: boolean) => void;
}

const simpleMarkdownToHtml = (md: string) => {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
  return html;
};

export function MarkdownEditor({ filePath, content, setContent, onSave, loading, saving, previewMode }: MarkdownEditorProps) {
  const preview = previewMode ?? true

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        {preview ? (
          <div className="flex-1 overflow-auto p-4 prose" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }} />
        ) : (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 p-4 font-mono text-sm bg-background text-foreground border-0 focus:outline-none" />
        )}
      </div>
    </div>
  )
}
