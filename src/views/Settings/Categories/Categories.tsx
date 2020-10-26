import React from 'react';
import { Props } from './Types';
import IncomeCategories from './IncomeCategories';
import { MoneyMoneyRes } from '../../../moneymoney';

export default function CategorySettings({
  moneyMoney,
  ...props
}: Omit<Props, 'categories'> & {
  moneyMoney: MoneyMoneyRes;
}) {
  const [categories] = moneyMoney.categories.read();

  return <IncomeCategories {...props} categories={categories} />;
}
