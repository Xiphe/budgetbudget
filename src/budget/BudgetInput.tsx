import React, { ChangeEvent, FocusEvent, useState } from 'react';
import { NumberFormatter } from '../lib';

type Props = {
  numberFormatter: NumberFormatter;
  categoryId: number;
  value: number;
  onChange: (ev: { value: number; id: number }) => void;
};

function isHTMLInputElement(elm: any): elm is HTMLInputElement {
  return elm instanceof HTMLInputElement;
}

export default function BudgetInput({
  onChange,
  value: numberValue,
  numberFormatter: { fractionDelimiter, format, parse, fractionStep },
  categoryId,
}: Props) {
  const [focus, setFocus] = useState<boolean>(false);
  const [stringValue, setStringValue] = useState<string | null>(null);
  const value =
    stringValue !== null ? stringValue : format(numberValue, !focus);
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    const isNan = value === '' || value.slice(-1) === fractionDelimiter;
    setStringValue(isNan ? value : null);
    onChange({
      id: categoryId,
      value: value === '' ? 0 : parse(value),
    });
  };
  const handleBlur = (ev: FocusEvent<HTMLInputElement>) => {
    setStringValue(null);
    setFocus(false);
  };
  const handleFocus = (ev: FocusEvent<HTMLInputElement>) => {
    setFocus(true);
  };
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
    const fractionI = value.indexOf(fractionDelimiter);
    const { selectionEnd, selectionStart } = target;
    const step =
      fractionI === -1 || (selectionStart || 0) <= fractionI ? 1 : fractionStep;
    const newValue =
      ev.key === 'ArrowDown' ? numberValue - step : numberValue + step;
    target.value = format(newValue);
    target.setSelectionRange(selectionStart || 0, selectionEnd || 0);
    setStringValue(null);
    onChange({
      value: newValue,
      id: categoryId,
    });
  };

  return (
    <input
      type="string"
      value={value}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
}
