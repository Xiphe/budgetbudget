import { Category, validateCategory } from './Types';
import { ipcRenderer } from 'electron';

export default async function getCategories(
  currency: string,
): Promise<[Category[], Category[]]> {
  const probablyCategories: unknown = await ipcRenderer.invoke(
    'MM_EXPORT_CATEGORIES',
  );

  if (!Array.isArray(probablyCategories)) {
    throw new Error('Unexpectedly got non-array as categories');
  }

  return probablyCategories.map(validateCategory).reduce(
    (memo, category) => {
      if (category.currency !== currency) {
        return memo;
      }
      if (category.default) {
        return [memo[0], memo[1].concat(category)];
      }
      return [memo[0].concat(category), memo[1]];
    },
    [[], []] as [Category[], Category[]],
  );
}
