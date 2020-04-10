import React, { ChangeEvent, useCallback } from 'react';
import { NumberFormatter, useInputProps } from '../../lib';
import styles from './Month.module.scss';

type Props = {
  numberFormatter: NumberFormatter;
  categoryId: number;
  value: number;
  onChange: (ev: { amount: number; id: number }) => void;
};

function isHTMLInputElement(elm: any): elm is HTMLInputElement {
  return elm instanceof HTMLInputElement;
}

export default function BudgetInput({
  onChange,
  value,
  numberFormatter: { fractionDelimiter, format, parse, fractionStep },
  categoryId,
}: Props) {
  const { error: _, ...inputProps } = useInputProps<
    number,
    ChangeEvent<HTMLInputElement>
  >({
    value,
    onChange: useCallback(
      (value) => onChange({ id: categoryId, amount: value }),
      [categoryId, onChange],
    ),
    validate: useCallback((ev) => parse(ev.target.value), [parse]),
    toInputFormat: useCallback(
      (value) => format(value, { thousandDelimiter: false }),
      [format],
    ),
    format,
  });
  const handleKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') {
      return;
    }
    const target = ev.target;
    if (!isHTMLInputElement(target)) {
      throw new Error('Unexpected keyup target');
    }
    ev.preventDefault();
    ev.stopPropagation();
    const fractionI = inputProps.value.indexOf(fractionDelimiter);
    const { selectionEnd, selectionStart } = target;
    const step =
      fractionI === -1 || (selectionStart || 0) <= fractionI ? 1 : fractionStep;
    const newValue = ev.key === 'ArrowDown' ? value - step : value + step;
    target.value = format(newValue, { thousandDelimiter: false });
    target.setSelectionRange(selectionStart || 0, selectionEnd || 0);
    inputProps.onChange(ev as any);
  };

  return (
    <input
      {...inputProps}
      className={styles.budgetInput}
      type="string"
      onKeyDown={handleKeyDown}
    />
  );
}
