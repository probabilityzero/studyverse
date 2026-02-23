'use client';

import { useState, useEffect, useRef, ReactElement } from 'react';
import { ChevronRight, ChevronDown, Folder, File, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileNode {
  name: string;
  type: 'file' | 'dir';
  path: string;
}

interface ExplorerProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

export function Explorer({ onFileSelect, selectedFile }: ExplorerProps) {
  const [selectedFileState, setSelectedFile] = useState<string | null>(selectedFile);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/']));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [inlineEdit, setInlineEdit] = useState<{
    mode: 'create' | 'rename' | null;
    parent?: string;
    target?: string;
    isFolder?: boolean;
    name?: string;
  }>({ mode: null });
  const inlineInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    const onRefresh = () => refreshDirectory();
    const onBaseDirChanged = (e: any) => {
      const p = e?.detail
      if (p) {
        setCurrentFolder(p)
        setFiles([])
        setLoading(true)
        loadDirectory(p)
      } else {
        loadCurrentFolder()
      }
    }
    window.addEventListener('workspace-refresh', onRefresh as EventListener)
    window.addEventListener('workspace-base-dir-changed', onBaseDirChanged as EventListener)
    const onCmAction = (e: any) => {
      const d = e?.detail
      if (!d) return
      if (d.action === 'open' && d.path) {
        const isDir = files.find(f => f.path === d.path && f.type === 'dir')
        if (isDir) onFileSelect && onFileSelect(`dir:${d.path}`)
        else onFileSelect && onFileSelect(d.path)
      }
    }
    const onWorkspaceCreate = (e: any) => {
      const d = e?.detail
      if (!d) return
      const parent = String(d.parent || '/')
      setExpanded((prev) => new Set(prev).add(parent))
      setInlineEdit({ mode: 'create', parent, isFolder: d.type === 'folder', name: '' })
    }
    const onWorkspaceRename = (e: any) => {
      const d = e?.detail
      if (!d || !d.path) return
      setInlineEdit({ mode: 'rename', target: d.path, name: d.path.split('/').pop() })
    }

    window.addEventListener('cm-action', onCmAction as EventListener)
    window.addEventListener('workspace-create', onWorkspaceCreate as EventListener)
    window.addEventListener('workspace-rename', onWorkspaceRename as EventListener)
    return () => {
      window.removeEventListener('workspace-refresh', onRefresh as EventListener)
      window.removeEventListener('workspace-base-dir-changed', onBaseDirChanged as EventListener)
      window.removeEventListener('cm-action', onCmAction as EventListener)
      window.removeEventListener('workspace-create', onWorkspaceCreate as EventListener)
      window.removeEventListener('workspace-rename', onWorkspaceRename as EventListener)
    }
  }, [currentPath])

  useEffect(() => {
    if (inlineEdit.mode && inlineInputRef.current) {
      inlineInputRef.current.focus()
      inlineInputRef.current.select()
    }
  }, [inlineEdit])

  const getParent = (p: string) => {
    if (!p) return '/'
    const parts = p.split('/').filter(Boolean)
    if (parts.length <= 1) return '/'
    return '/' + parts.slice(0, -1).join('/')
  }

  const commitCreate = async (name: string) => {
    if (!inlineEdit.parent) return setInlineEdit({ mode: null })
    const parent = inlineEdit.parent
    const normalizedParent = parent === '/' ? '' : parent
    const newPath = `${normalizedParent}/${name}`.replace(/\/+/g, '/')
    try {
      if (inlineEdit.isFolder) {
        await fetch(`${apiUrl}/api/create-folder`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: newPath })
        })
      } else {
        await fetch(`${apiUrl}/api/create-file`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath: newPath })
        })
      }
      refreshDirectory()
    } catch (err) {
      console.error('Create failed', err)
    } finally {
      setInlineEdit({ mode: null })
    }
  }

  const commitRename = async (newName: string) => {
    if (!inlineEdit.target) return setInlineEdit({ mode: null })
    const oldPath = inlineEdit.target
    const parent = getParent(oldPath)
    const normalizedParent = parent === '/' ? '' : parent
    const newPath = `${normalizedParent}/${newName}`.replace(/\/+/g, '/')
    try {
      await fetch(`${apiUrl}/api/rename`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPath, newPath })
      })
      refreshDirectory()
    } catch (err) {
      console.error('Rename failed', err)
    } finally {
      setInlineEdit({ mode: null })
    }
  }

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

    const rows: ReactElement[] = []

    if (inlineEdit.mode === 'create' && (inlineEdit.parent || '/') === parentPath) {
      rows.push(
        <div key="__create__" className={`flex items-center gap-1 px-2 py-1 text-sm bg-accent/10 rounded`} style={{ paddingLeft: `${depth * 16 + 8}px` }}>
          <div className="w-3" />
          <div className="h-4 w-4 bg-muted/50 rounded-sm" />
          <input
            ref={inlineInputRef}
            className="flex-1 bg-transparent outline-none text-sm px-2"
            value={inlineEdit.name || ''}
            onChange={(e) => setInlineEdit((s) => ({ ...s, name: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitCreate((e.target as HTMLInputElement).value.trim())
              if (e.key === 'Escape') setInlineEdit({ mode: null })
            }}
            onBlur={(e) => { const v = (e.target as HTMLInputElement).value.trim(); if (v) commitCreate(v); else setInlineEdit({ mode: null }) }}
            placeholder={inlineEdit.isFolder ? 'New folder name' : 'New file name'}
          />
        </div>
      )
    }

    children.forEach((node) => {
      const isRenameTarget = inlineEdit.mode === 'rename' && inlineEdit.target === node.path

      rows.push(
        <div key={node.path}>
          <div
            data-context={node.type === 'dir' ? 'dir' : 'file'}
            data-path={node.path}
            className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent transition-colors ${
              selectedFile === node.path ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
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
                {isRenameTarget ? (
                  <input
                    ref={inlineInputRef}
                    className="flex-1 bg-transparent outline-none text-sm px-2"
                    value={inlineEdit.name || ''}
                    onChange={(e) => setInlineEdit((s) => ({ ...s, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename((e.target as HTMLInputElement).value.trim())
                      if (e.key === 'Escape') setInlineEdit({ mode: null })
                    }}
                    onBlur={(e) => { const v = (e.target as HTMLInputElement).value.trim(); if (v) commitRename(v); else setInlineEdit({ mode: null }) }}
                  />
                ) : (
                  <span onClick={(e) => { e.stopPropagation(); handleFolderSelect(node.path); onFileSelect && onFileSelect(`dir:${node.path}`); }}>{node.name}</span>
                )}
              </>
            ) : (
              <div className='flex items-center gap-1 w-full h-full' onClick={(e) => { e.stopPropagation(); onFileSelect(node.path); }}>
                <div className="w-3" />
                <File className="h-4 w-4" />
                {isRenameTarget ? (
                  <input
                    ref={inlineInputRef}
                    className="flex-1 bg-transparent outline-none text-sm px-2"
                    value={inlineEdit.name || ''}
                    onChange={(e) => setInlineEdit((s) => ({ ...s, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename((e.target as HTMLInputElement).value.trim())
                      if (e.key === 'Escape') setInlineEdit({ mode: null })
                    }}
                    onBlur={(e) => { const v = (e.target as HTMLInputElement).value.trim(); if (v) commitRename(v); else setInlineEdit({ mode: null }) }}
                  />
                ) : (
                  <span>{node.name}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )
    })

    return rows
  };

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r border-border">
      <div className="h-10 px-3 border-b items-center justify-between flex border-border">
          <h3 className="font-medium pl-4 text-foreground uppercase">Explorer</h3>
      </div>
      <div className="flex-1 overflow-y-auto font-light" data-context="explorer" data-path={currentPath}>
        {error ? (
          <div className="p-4">
            <div className="text-sm text-red-600 bg-red-50 p-2">
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
    </div>
  );
}
