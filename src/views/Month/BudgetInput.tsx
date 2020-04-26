import React, { useCallback } from 'react';
import { NumberFormatter, useAmountInputProps } from '../../lib';
import styles from './Month.module.scss';

type Props = {
  numberFormatter: NumberFormatter;
  categoryId: string;
  value: number;
  onChange: (ev: { amount: number; id: string }) => void;
};

export default function BudgetInput({
  onChange,
  value,
  numberFormatter,
  categoryId,
}: Props) {
  const props = useAmountInputProps({
    numberFormatter,
    value,
    onChange: useCallback(
      (amount: number) => onChange({ amount, id: categoryId }),
      [categoryId, onChange],
    ),
  });

  return <input {...props} className={styles.budgetInput} type="string" />;
}
