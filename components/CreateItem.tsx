'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, FolderPlus, FilePlusCorner } from 'lucide-react';

interface CreateItemProps {
  currentPath: string;
  onItemCreated: () => void;
}

export function CreateItem({ currentPath, onItemCreated }: CreateItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'file' | 'folder'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleCreate = async () => {
    if (!itemName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = itemType === 'file' ? '/api/create-file' : '/api/create-folder';
      const pathKey = itemType === 'file' ? 'filePath' : 'folderPath';
      const fullPath = currentPath === '/' ? itemName : `${currentPath}/${itemName}`;

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [pathKey]: fullPath })
      });
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response from server: ${text}`);
      }

      if (!response.ok) {
        const msg = data?.error || `Server error: ${response.status} ${response.statusText}`;
        setError(msg);
      } else if (data.error) {
        setError(data.error);
      } else {
        setItemName('');
        setIsOpen(false);
        onItemCreated();
      }
    } catch (error) {
      setError(`Failed to create ${itemType}: ` + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <FilePlusCorner className="h-4 w-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Button
              variant={itemType === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setItemType('file')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              File
            </Button>
            <Button
              variant={itemType === 'folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setItemType('folder')}
              className="gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Folder
            </Button>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="item-name" className="text-sm font-medium">
              {itemType === 'file' ? 'File' : 'Folder'} Name
            </label>
            <Input
              id="item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={`Enter ${itemType} name`}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || !itemName.trim()}
            >
              Create {itemType}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}