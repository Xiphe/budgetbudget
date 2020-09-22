import React from 'react';
import { Props } from './Types';
import IncomeCategories from './IncomeCategories';
import { MoneyMoneyRes } from '../../../moneymoney';

export default function CategorySettings({
  moneyMoney: { readCategories },
  ...props
}: Omit<Props, 'categories'> & {
  moneyMoney: MoneyMoneyRes;
}) {
  const [categories] = readCategories();

  return <IncomeCategories {...props} categories={categories} />;
}
