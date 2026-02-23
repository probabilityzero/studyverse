import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { getBaseDir, getWorkspaces, getActiveWorkspace } from '../context';

export function registerListRoute(app: Hono) {
  app.get('/api/list', async (c) => {
    try {
      const rawDir = c.req.query('dir') || '/';
      const BASE_DIR = getBaseDir();
      const dirPath = String(rawDir);
      const rel = dirPath === '/' || dirPath === '' ? '.' : dirPath.replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);

      if (!fullPath.startsWith(BASE_DIR)) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const files = entries
        .filter((entry) => !entry.name.startsWith('.'))
        .map((entry) => {
          const entryRel = rel === '.' ? entry.name : `${rel}/${entry.name}`;
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'dir' : 'file',
            path: entryRel.startsWith('/') ? entryRel : `/${entryRel}`,
          };
        })
        .sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'dir' ? -1 : 1;
        });

      const workspaces = getWorkspaces();
      const active = getActiveWorkspace();
      return c.json({ files, basePath: dirPath, currentBaseDir: BASE_DIR, workspaces, active });
    } catch (error) {
      console.error('Error listing directory:', error);
      return c.json({ error: 'Failed to list directory' }, 500);
    }
  });
}
