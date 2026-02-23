'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, File, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateItem } from '@/components/CreateItem';
import { FolderPicker } from './FolderPicker';
import { FileInlinePreview } from './viewers/FileInlinePreview';

interface FileNode {
  name: string;
  type: 'file' | 'dir';
  path: string;
}

interface FileExplorerProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}


export function FileExplorer({ onFileSelect, selectedFile }: FileExplorerProps) {
  const [selectedFileState, setSelectedFile] = useState<string | null>(selectedFile);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/']));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadCurrentFolder = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/list`);
      if (response.ok) {
        const data = await response.json();
        if (data.currentBaseDir) {
          setCurrentFolder(data.currentBaseDir);
        }
      }
    } catch (error) {
      console.error('Failed to load current folder:', error);
    }
  };

  useEffect(() => {
    loadCurrentFolder();
  }, []);

  const handleFolderSelect = (folderPath: string) => {
    setCurrentFolder(folderPath);
    setSelectedFile(null);
  };
  
  useEffect(() => {
    loadDirectory('/');
  }, []);

  const loadDirectory = async (dirPath: string) => {
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/list?dir=${encodeURIComponent(dirPath)}`);
      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText || 'Unknown error');
        throw new Error(`Server error: ${response.status} ${response.statusText} - ${text}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response from server: ${text}`);
      }

      if (data.error) {
        setError(data.error);
        console.error('API error:', data.error);
      } else if (data.files) {
        const normalize = (p: string) => {
          const fixed = p.replace(/\\/g, '/');
          return fixed.startsWith('/') ? fixed : `/${fixed}`;
        };

        const normalizedFiles: FileNode[] = data.files.map((f: any) => ({
          name: f.name,
          type: f.type,
          path: normalize(f.path),
        }));

        setFiles((prev) => {
          const dirPrefix = dirPath === '/' ? '/' : (dirPath.endsWith('/') ? dirPath : `${dirPath}/`);
          const filtered = prev.filter((f) => !f.path.startsWith(dirPrefix) || f.path === dirPath);
          const combined = [...filtered, ...normalizedFiles];
          const seen = new Set<string>();
          return combined.filter((f) => {
            if (seen.has(f.path)) return false;
            seen.add(f.path);
            return true;
          });
        });

        if (data.basePath) {
          const fixedBase = String(data.basePath).replace(/\\/g, '/');
          setCurrentPath(fixedBase === '' ? '/' : (fixedBase.startsWith('/') ? fixedBase : `/${fixedBase}`));
        }
      }
    } catch (error) {
      setError('Failed to load directory: ' + String(error));
      console.error('Error loading directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDirectory = () => {
    setFiles([]);
    setLoading(true);
    loadDirectory(currentPath);
  };

  const handleItemCreated = () => {
    refreshDirectory();
  };

  const toggleExpanded = (dirPath: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
      loadDirectory(dirPath);
    }
    setExpanded(newExpanded);
  };

  const getChildrenForPath = (parentPath: string) => {
    const getParent = (p: string) => {
      const parts = p.split('/').filter(Boolean);
      if (parts.length <= 1) return '/';
      const parent = '/' + parts.slice(0, -1).join('/');
      return parent;
    };

    return files.filter((f) => getParent(f.path) === (parentPath === '' ? '/' : parentPath));
  };

  const renderTree = (parentPath: string = '/', depth: number = 0) => {
    const children = getChildrenForPath(parentPath);
    
    return children.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded transition-colors ${
            selectedFile === node.path ? 'bg-primary/10 text-primary' : 'text-foreground'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            // clicking the entire row toggles expansion for both files and folders
            toggleExpanded(node.path);
          }}
        >
          {node.type === 'dir' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-8 p-0"
                onClick={(e) => { e.stopPropagation(); toggleExpanded(node.path); }}
              >
                {expanded.has(node.path) ? (
                  <div className="flex items-center">
                    <ChevronRight className="h-3 w-3 gap-1" />
                    <Folder className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ChevronDown className="h-3 w-3 gap-1" />
                    <Folder className="fill-foreground h-4 w-4" />
                  </div>
                )}
              </Button>
              <span onClick={(e) => { e.stopPropagation(); handleFolderSelect(node.path); onFileSelect && onFileSelect(`dir:${node.path}`); }}>{node.name}</span>
            </>
          ) : (
            <div className='flex items-center gap-1'>
              <div className="w-3" />
              <File className="h-4 w-4" />
              <span onClick={(e) => { e.stopPropagation(); onFileSelect(node.path); }}>{node.name}</span>
            </div>
          )}
        </div>
        {expanded.has(node.path) && node.type === 'dir' && renderTree(node.path, depth + 1)}
        {expanded.has(node.path) && node.type === 'file' && (
          <div style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
            <FileInlinePreview filePath={node.path} apiUrl={apiUrl} />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r border-border">
      <div className="h-10 px-3 border-b items-center justify-between flex border-border">
          <h3 className="font-medium pl-4 text-foreground uppercase">Explorer</h3>
          <CreateItem currentPath={currentPath} onItemCreated={handleItemCreated} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4">
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
            <Button onClick={refreshDirectory} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="py-2">{renderTree()}</div>
        )}
      </div>
        <div className="h-10 flex items-center justify-between gap-4 px-3 border-t border-border text-foreground/80">
          <FolderPicker onFolderSelect={handleFolderSelect} currentFolder={currentFolder} />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshDirectory}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshDirectory}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <Settings className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
    </div>
  );
}
