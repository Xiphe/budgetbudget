import { useState, useEffect, useCallback } from 'react';
import { Category } from './Types';
import getCategories from './getCategories';

export default function useCategories(
  currency: string,
): [Category[] | null | Error, Category[], () => void] {
  const [categories, setCategories] = useState<Category[] | null | Error>(null);
  const [defaultCategories, setDefaultCategories] = useState<Category[]>([]);
  useEffect(() => {
    setCategories(null);
  }, [currency]);
  useEffect(() => {
    if (categories !== null) {
      return;
    }
    let canceled = false;
    getCategories(currency)
      .then(([cat, def]) => {
        if (!canceled) {
          setCategories(cat);
          setDefaultCategories(def);
        }
      })
      .catch((err) => {
        if (!canceled) {
          setCategories(err);
          setDefaultCategories([]);
        }
      });

    return () => {
      canceled = true;
    };
  }, [categories, currency]);

  return [
    categories,
    defaultCategories,
    useCallback(() => setCategories(null), []),
  ];
}
