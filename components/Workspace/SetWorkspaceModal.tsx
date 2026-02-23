'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderOpen, Check } from 'lucide-react';

interface FolderPickerProps {
  onFolderSelect: (folderPath: string) => void;
  currentFolder: string;
}

export function FolderPicker({ onFolderSelect, currentFolder }: FolderPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPath, setInputPath] = useState(currentFolder);
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<string[]>([]);

  const fetchWorkspaces = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/workspaces`);
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchWorkspaces();
  }, [isOpen]);

  useEffect(() => {
    setInputPath(currentFolder || '');
  }, [currentFolder]);

  const handleSelectFolder = async () => {
    if (!inputPath.trim()) return;
    
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/set-base-dir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseDir: inputPath.trim() })
      });

      if (response.ok) {
        onFolderSelect(inputPath.trim());
        setIsOpen(false);
        fetchWorkspaces();
      }
    } catch (error) {
      console.error('Failed to set folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkspace = async () => {
    if (!inputPath.trim()) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: inputPath.trim() }),
      });
      if (res.ok) {
        await fetchWorkspaces();
        setInputPath('');
      } else {
        console.error('Failed to add workspace');
      }
    } catch (err) {
      console.error('Failed to add workspace', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWorkspace = async (p: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/workspaces`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p }),
      });
      if (res.ok) {
        await fetchWorkspaces();
      }
    } catch (err) {
      console.error('Failed to remove workspace', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          My Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Select Base Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="folder-path" className="text-sm font-medium">
              Folder Path
            </label>
            <Input
              id="folder-path"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="/path/to/your/folder"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Workspaces</label>
            <div className="max-h-40 overflow-auto border rounded p-2">
              {workspaces.length === 0 ? (
                <div className="text-sm text-muted-foreground">No workspaces</div>
              ) : (
                workspaces.map((w) => (
                  <div key={w} className="flex items-center justify-between gap-2 text-sm py-1">
                    <div className="truncate">{w}</div>
                    <div className="flex gap-1">
                      <Button variant="ghost" onClick={async () => { setInputPath(w); await handleSelectFolder(); }}>
                        Set
                      </Button>
                      <Button variant="ghost" onClick={() => handleRemoveWorkspace(w)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelectFolder}
              disabled={loading || !inputPath.trim()}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}