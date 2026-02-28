import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { registerListRoute } from './routes/list';
import { registerFileRoute } from './routes/file';
import { registerSaveRoute } from './routes/save';
import { registerSetBaseDirRoute } from './routes/setBaseDir';
import { registerCreateFileRoute } from './routes/createFile';
import { registerCreateFolderRoute } from './routes/createFolder';
import { registerRawRoute } from './routes/raw';
import { registerWorkspacesRoute } from './routes/workspaces';
import { registerRenameRoute } from './routes/rename';
import { registerAiRoute } from './routes/ai';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
);

registerListRoute(app);
registerFileRoute(app);
registerSaveRoute(app);
registerSetBaseDirRoute(app);
registerCreateFileRoute(app);
registerCreateFolderRoute(app);
registerRawRoute(app);
registerWorkspacesRoute(app);
registerRenameRoute(app);
registerAiRoute(app);

app.get('/', (c) => c.json({ status: 'ok', message: 'File server running' }));

export default app;
