import { fs, vol } from 'memfs';
import expose from './_expose.win';

vol.fromJSON({
  '/_appPath/userData/Settings': '{}',
});

const { readFile, writeFile, existsSync, writeFileSync, readFileSync } = fs;

expose('fs', fs);
expose('vol', vol);

export default fs;
export { readFile, writeFile, existsSync, writeFileSync, readFileSync };
