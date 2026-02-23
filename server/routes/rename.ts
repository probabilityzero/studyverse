import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getBaseDir } from '../context';

export function registerRenameRoute(app: Hono) {
  app.post('/api/rename', async (c) => {
    try {
      const body = await c.req.json();
      const { oldPath, newPath } = body;
      if (!oldPath || !newPath) {
        return c.json({ error: 'oldPath and newPath required' }, 400);
      }

      const BASE_DIR = getBaseDir();
      const oldRel = String(oldPath) === '/' || String(oldPath) === '' ? '.' : String(oldPath).replace(/^[/\\]+/, '');
      const newRel = String(newPath) === '/' || String(newPath) === '' ? '.' : String(newPath).replace(/^[/\\]+/, '');
      const oldFull = path.join(BASE_DIR, oldRel);
      const newFull = path.join(BASE_DIR, newRel);

      if (!oldFull.startsWith(BASE_DIR) || !newFull.startsWith(BASE_DIR)) {
        return c.json({ error: 'Access denied' }, 403);
      }

      if (!existsSync(oldFull)) {
        return c.json({ error: 'Source does not exist' }, 400);
      }

      // ensure destination directory exists
      const destDir = path.dirname(newFull);
      await fs.mkdir(destDir, { recursive: true });

      await fs.rename(oldFull, newFull);

      return c.json({ success: true, oldPath: oldRel.startsWith('/') ? oldRel : `/${oldRel}`, newPath: newRel.startsWith('/') ? newRel : `/${newRel}` });
    } catch (err) {
      console.error('Rename error', err);
      return c.json({ error: 'Failed to rename' }, 500);
    }
  });
}
