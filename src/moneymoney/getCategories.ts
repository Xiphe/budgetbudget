import { Category, validateCategory } from './Types';
import { ipcRenderer } from 'electron';
import memoizeOne from 'memoize-one';
import { createResource, Resource } from '../lib';

type SplitCategories = [Category[], Category[]];
export type CategoryResource = Resource<SplitCategories>;

const splitCurrencyCategories = memoizeOne(
  (currency: string, categories: Category[]) =>
    categories.reduce(
      (memo, category): SplitCategories => {
        if (category.currency !== currency) {
          return memo;
        }
        if (category.default) {
          return [memo[0], memo[1].concat(category)];
        }
        return [memo[0].concat(category), memo[1]];
      },
      [[], []] as SplitCategories,
    ),
);

export async function getCategories(): Promise<Category[]> {
  const probablyCategories: unknown = await ipcRenderer.invoke(
    'MM_EXPORT_CATEGORIES',
  );

  if (!Array.isArray(probablyCategories)) {
    throw new Error('Unexpectedly got non-array as categories');
  }

  return probablyCategories.map(validateCategory);
}
const getCategoriesMemo = memoizeOne((cacheToken: symbol) => getCategories());

function getCategoryResource(currency: string, cacheToken: symbol) {
  return createResource(() =>
    getCategoriesMemo(cacheToken).then(
      splitCurrencyCategories.bind(null, currency),
    ),
  );
}

export default memoizeOne(getCategoryResource);
