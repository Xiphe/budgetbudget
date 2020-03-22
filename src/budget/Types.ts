import { isObject, optional, isStringArray, isString } from '../lib';

type Settings = {
  accounts?: string[];
};
export type BudgetState = {
  name?: string;
  settings: Settings;
};

function isSettings(data: unknown): data is Settings {
  return isObject(data) && optional(data.accounts, isStringArray);
}

export function isBudgetState(data: unknown): data is BudgetState {
  return (
    isObject(data) && optional(data.name, isString) && isSettings(data.settings)
  );
}
