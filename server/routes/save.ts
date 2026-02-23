import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { getBaseDir } from '../context';

export function registerSaveRoute(app: Hono) {
  app.post('/api/save', async (c) => {
    try {
      const body = await c.req.json();
      const { path: filePath, content } = body;

      if (!filePath || content === undefined) {
        return c.json({ error: 'File path and content required' }, 400);
      }

      const BASE_DIR = getBaseDir();
      const p = String(filePath);
      const rel = p === '/' || p === '' ? '.' : p.replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);

      if (!fullPath.startsWith(BASE_DIR)) {
        return c.json({ error: 'Access denied' }, 403);
      }

      await fs.writeFile(fullPath, content, 'utf-8');
      return c.json({ success: true, path: rel.startsWith('/') ? rel : `/${rel}` });
    } catch (error) {
      console.error('Error saving file:', error);
      return c.json({ error: 'Failed to save file' }, 500);
    }
  });
}
