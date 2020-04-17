import { join } from 'path';

export default __dirname.includes('/app.asar/')
  ? join(process.resourcesPath, 'scripts')
  : join(__dirname, 'scripts');
