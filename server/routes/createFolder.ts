import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getBaseDir } from '../context';

export function registerCreateFolderRoute(app: Hono) {
  app.post('/api/create-folder', async (c) => {
    try {
      const body = await c.req.json();
      const { folderPath } = body;

      if (!folderPath) {
        return c.json({ error: 'Folder path required' }, 400);
      }

      const BASE_DIR = getBaseDir();
      const p = String(folderPath);
      const rel = p === '/' || p === '' ? '.' : p.replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);

      if (!fullPath.startsWith(BASE_DIR)) {
        return c.json({ error: 'Access denied' }, 403);
      }

      if (existsSync(fullPath)) {
        return c.json({ error: 'Folder already exists' }, 400);
      }

      await fs.mkdir(fullPath, { recursive: true });
      return c.json({ success: true, path: rel.startsWith('/') ? rel : `/${rel}` });
    } catch (error) {
      console.error('Error creating folder:', error);
      return c.json({ error: 'Failed to create folder' }, 500);
    }
  });
}
