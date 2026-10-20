// Vercel serverless entry. The whole Express server is bundled into one file by
// `npm run build:api` (runs automatically inside `npm run build`), because Vercel
// cannot load the original TypeScript files with extension-less imports.
import app from '../dist-api/server.mjs';

export default app;
