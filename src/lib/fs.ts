import { writeFile as wft, readFile as rft, existsSync as est } from 'fs';
const fs = window.require('fs');

export const writeFile: typeof wft = fs.writeFile;
export const readFile: typeof rft = fs.readFile;
export const existsSync: typeof est = fs.existsSync;
