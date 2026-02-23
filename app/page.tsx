'use client';

import { useState, useEffect } from 'react';
import { Explorer } from '@/components/Explorer/_index';
import WorkspaceFooter from '@/components/Workspace/_index';
import { FileEditor } from '@/components/FileViewer/_index';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable-panels';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('');

  return (
    <main className="h-screen w-full flex flex-col bg-background">

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={20} maxSize={25}>
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <Explorer 
                onFileSelect={setSelectedFile} 
                selectedFile={selectedFile}
                key={currentFolder}
              />
            </div>
            <WorkspaceFooter />
          </div>
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel defaultSize={80} minSize={40}>
          <FileEditor filePath={selectedFile} onClose={() => setSelectedFile(null)} onOpenFile={setSelectedFile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
