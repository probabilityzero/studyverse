import app from './app';

const port = process.env.SERVER_PORT || 3001;
console.log(`Starting file server on http://localhost:${port}`);
console.log(`Base directory: ${process.env.FILE_DIR || 'default'}`);

export default {
  port,
  fetch: app.fetch,
};
