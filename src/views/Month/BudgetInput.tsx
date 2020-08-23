import React, { useCallback } from 'react';
import {
  NumberFormatter,
  useAmountInputProps,
  useMonth,
  useMonths,
  parseBudgetInput,
} from '../../lib';
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

function handleEnterReturn(ev: React.KeyboardEvent<HTMLInputElement>) {
  const target = ev.target as HTMLInputElement;
  if (ev.nativeEvent.code === 'NumpadEnter') {
    ev.stopPropagation();
    ev.preventDefault();
    target.blur();
  } else if (ev.nativeEvent.code === 'Enter') {
    ev.stopPropagation();
    ev.preventDefault();
    let container = target.parentElement;
    while (container && !container.dataset.row) {
      container = container.parentElement;
    }
    let nextLeaf = container
      ? (container.nextElementSibling as HTMLElement)
      : null;
    while (nextLeaf && nextLeaf.dataset.row !== 'leaf') {
      nextLeaf = nextLeaf.nextElementSibling as HTMLElement;
    }
    const input = nextLeaf ? nextLeaf.querySelector('input') : null;
    if (input) {
      input.focus();
    }
  }
}

export default function BudgetInput({
  onChange,
  value,
  numberFormatter,
  categoryId,
}: Props) {
  const currentMonth = useMonth();
  const months = useMonths();

  return (
    <input
      {...useAmountInputProps({
        numberFormatter,
        value,
        onKeyDown: handleEnterReturn,
        parse: useCallback(
          (val: string) =>
            parseBudgetInput(val, {
              numberFormatter,
              currentMonth,
              months,
              categoryId,
            }),
          [numberFormatter, currentMonth, months, categoryId],
        ),
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
