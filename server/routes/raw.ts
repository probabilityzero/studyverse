import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { getBaseDir } from '../context';

const mimeFor = (p: string) => {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.html' || ext === '.htm') return 'text/html; charset=utf-8';
  if (ext === '.md') return 'text/markdown; charset=utf-8';
  if (ext === '.txt') return 'text/plain; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
};

export function registerRawRoute(app: Hono) {
  app.get('/api/raw', async (c) => {
    try {
      const raw = c.req.query('path');
      if (!raw) return c.text('Path required', 400);

      const BASE_DIR = getBaseDir();
      const p = String(raw);
      const rel = p === '/' || p === '' ? '.' : p.replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);

      if (!fullPath.startsWith(BASE_DIR)) return c.text('Access denied', 403);

      const data = await fs.readFile(fullPath);
      const mime = mimeFor(fullPath);
      return new Response(data, { headers: { 'Content-Type': mime } });
    } catch (err) {
      console.error('Error serving raw file:', err);
      return c.text('Failed to read file', 500);
    }
  });
}
