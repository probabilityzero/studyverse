import { Hono } from 'hono';
import { setBaseDir } from '../context';

export function registerSetBaseDirRoute(app: Hono) {
  app.post('/api/set-base-dir', async (c) => {
    try {
      const body = await c.req.json();
      const { baseDir } = body;

      if (!baseDir) {
        return c.json({ error: 'Base directory required' }, 400);
      }

      const updated = await setBaseDir(baseDir);
      return c.json({ success: true, baseDir: updated });
    } catch (error) {
      console.error('Error setting base directory:', error);
      return c.json({ error: 'Failed to set base directory' }, 500);
    }
  });
}
