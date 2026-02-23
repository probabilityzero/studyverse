import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { getBaseDir } from '../context';

export function registerFileRoute(app: Hono) {
  app.get('/api/file', async (c) => {
    try {
      const rawPath = c.req.query('path');
      if (!rawPath) {
        return c.json({ error: 'File path required' }, 400);
      }

      const BASE_DIR = getBaseDir();
      const p = String(rawPath);
      const rel = p === '/' || p === '' ? '.' : p.replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);

      if (!fullPath.startsWith(BASE_DIR)) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        return c.json({ error: 'Path is a directory' }, 400);
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      return c.json({ content, path: rel.startsWith('/') ? rel : `/${rel}` });
    } catch (error) {
      console.error('Error reading file:', error);
      return c.json({ error: 'Failed to read file' }, 500);
    }
  });
}
