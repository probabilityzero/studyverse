import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getBaseDir } from '../context';

export function registerCreateFileRoute(app: Hono) {
  app.post('/api/create-file', async (c) => {
    try {
      const body = await c.req.json();
      const { filePath, content = '' } = body;

      if (!filePath) {
        return c.json({ error: 'File path required' }, 400);
      }

      const BASE_DIR = getBaseDir();
      const p = String(filePath);
      const rel = p === '/' || p === '' ? '.' : p.replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);

      if (!fullPath.startsWith(BASE_DIR)) {
        return c.json({ error: 'Access denied' }, 403);
      }

      if (existsSync(fullPath)) {
        return c.json({ error: 'File already exists' }, 400);
      }

      await fs.writeFile(fullPath, content, 'utf-8');
      return c.json({ success: true, path: rel.startsWith('/') ? rel : `/${rel}` });
    } catch (error) {
      console.error('Error creating file:', error);
      return c.json({ error: 'Failed to create file' }, 500);
    }
  });
}
