import { atom, useRecoilState } from 'recoil';
import getCategories, { CategoryResource } from './getCategories';
import { useMemo } from 'react';
import { withRefresh } from '../lib/createResource';

const categoriesResState = atom({
  key: 'categoriesRes',
  default: getCategories(),
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
