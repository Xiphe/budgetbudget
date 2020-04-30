import React, { useCallback } from 'react';
import { NumberFormatter, useAmountInputProps } from '../../lib';
import styles from './Month.module.scss';

type Props = {
  numberFormatter: NumberFormatter;
  categoryId: string;
  value: number;
  onChange: (ev: { amount: number; id: string }) => void;
};

function select({ target }: React.FocusEvent<HTMLInputElement>) {
  setTimeout(() => {
    target.select();
  }, 0);
}

export default function BudgetInput({
  onChange,
  value,
  numberFormatter,
  categoryId,
}: Props) {
  return (
    <input
      {...useAmountInputProps({
        numberFormatter,
        value,
        onChange: useCallback(
          (amount: number) => onChange({ amount, id: categoryId }),
          [categoryId, onChange],
        ),
      })}
      onFocus={select}
      className={styles.budgetInput}
      type="string"
    />
  );
}
