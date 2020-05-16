import React from 'react';
import { useCategories } from '../../../moneymoney';
import { Props } from './Types';
import IncomeCategories from './IncomeCategories';

export default function CategorySettings(props: Omit<Props, 'categories'>) {
  const [categories] = useCategories().read();

  return <IncomeCategories {...props} categories={categories} />;
}
