import { basename as bnt } from 'path';
const path = window.require('path');

export const basename: typeof bnt = path.basename;
