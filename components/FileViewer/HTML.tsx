'use client';


interface HTMLEditorProps {
  filePath: string;
  content: string;
  setContent: (c: string) => void;
  onSave: () => Promise<void>;
  loading?: boolean;
  saving?: boolean;
  apiUrl?: string;
}

export function HTMLEditor({ filePath, content, setContent, onSave, loading, saving, apiUrl }: HTMLEditorProps) {
  return (
    <div className="h-full">
      <div className="flex-1 flex">
        <iframe srcDoc={content} className="flex-1 border-0" title="html-preview" />
      </div>
    </div>
  )
}
