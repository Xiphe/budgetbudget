import { selector, useRecoilState } from 'recoil';
import getCategories, { CategoryResource } from './getCategories';
import { useMemo } from 'react';
import { withRefresh } from '../lib/createResource';
import { settingsState, BudgetState } from '../budget';

const categoriesResState = selector({
  key: 'categoriesRes',
  get: ({ get }: any) =>
    getCategories((get(settingsState) as BudgetState['settings']).currency),
});

export default function useCategories(): CategoryResource {
  const [categoriesRes, setCategoriesRes] = useRecoilState(categoriesResState);
  return useMemo(
    () =>
      withRefresh(categoriesRes, () =>
        setCategoriesRes(categoriesRes.reCreate()),
      ),
    [categoriesRes, setCategoriesRes],
  );
}
