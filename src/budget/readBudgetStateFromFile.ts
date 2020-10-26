import { validateBudgetState } from './Types';
import { readFile as rf } from 'fs';
import { promisify } from 'util';
const readFile = promisify(rf);

export default async function readBudgetStateFromFile(file: string) {
  return validateBudgetState(JSON.parse((await readFile(file)).toString()));
}
