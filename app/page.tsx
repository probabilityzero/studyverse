'use client';

import { useState, useEffect } from 'react';
import { FileExplorer } from '@/components/FileExplorer';
import { FileEditor } from '@/components/FileEditor';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable-panels';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('');

  return (
    <main className="h-screen w-full flex flex-col bg-background">

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileExplorer 
            onFileSelect={setSelectedFile} 
            selectedFile={selectedFile}
            key={currentFolder}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={80} minSize={40}>
          <FileEditor filePath={selectedFile} onClose={() => setSelectedFile(null)} onOpenFile={setSelectedFile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
