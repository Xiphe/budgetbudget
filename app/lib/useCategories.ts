import { useState, useEffect } from 'react';
import { useClient, CategoryTree } from './moneyMoney';
import { IpcError } from '../../shared/ipc';

export default function useCategories() {
  const api = useClient();
  const [categories, setCategories] = useState<
    CategoryTree[] | null | IpcError
  >(null);
  useEffect(() => {
    let canceled = false;
    const setUnlessCanceled = (transactions: CategoryTree[] | IpcError) => {
      if (!canceled) {
        setCategories(transactions);
      }
    };
    api.getCategories().then(setUnlessCanceled, setUnlessCanceled);
    return () => {
      canceled = true;
    };
  }, [api, setCategories]);
  return categories;
}
