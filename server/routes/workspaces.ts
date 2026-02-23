import { Hono } from 'hono';
import { getWorkspaces, addWorkspace, removeWorkspace, getActiveWorkspace } from '../context';

export function registerWorkspacesRoute(app: Hono) {
  app.get('/api/workspaces', (c) => {
    try {
      const list = getWorkspaces();
      const active = getActiveWorkspace();
      return c.json({ workspaces: list, active });
    } catch (err) {
      console.error('Error listing workspaces:', err);
      return c.json({ workspaces: [], active: null }, 500);
    }
  });

  app.post('/api/workspaces', async (c) => {
    try {
      const body = await c.req.json();
      const { path } = body;
      if (!path) return c.json({ error: 'Path required' }, 400);
      const list = await addWorkspace(path);
      return c.json({ workspaces: list });
    } catch (err: any) {
      console.error('Error adding workspace:', err);
      return c.json({ error: String(err) }, 500);
    }
  });

  app.delete('/api/workspaces', async (c) => {
    try {
      const body = await c.req.json();
      const { path } = body;
      if (!path) return c.json({ error: 'Path required' }, 400);
      const list = await removeWorkspace(path);
      return c.json({ workspaces: list });
    } catch (err: any) {
      console.error('Error removing workspace:', err);
      return c.json({ error: String(err) }, 500);
    }
  });
}
