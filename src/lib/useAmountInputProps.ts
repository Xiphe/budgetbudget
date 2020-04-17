import { useCallback } from 'react';
import { NumberFormatter } from './createNumberFormatter';
import useInputProps from './useInputProps';

function isHTMLInputElement(elm: any): elm is HTMLInputElement {
  return elm instanceof HTMLInputElement;
}
type CurrencyInputConfig = {
  value: number;
  onChange: (value: number) => void;
  numberFormatter: NumberFormatter;
};
export default function useCurrencyInput({
  value,
  onChange,
  numberFormatter: { fractionDelimiter, format, parse, fractionStep },
}: CurrencyInputConfig) {
  const { error: _, ...inputProps } = useInputProps<number>({
    value,
    onChange: onChange,
    validate: useCallback((ev) => parse(ev.target.value), [parse]),
    toInputFormat: useCallback(
      (value) => format(value, { thousandDelimiter: false }),
      [format],
    ),
    format,
  });
  const onInternalChange = inputProps.onChange;
  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') {
        return;
      }
      const target = ev.target;
      if (!isHTMLInputElement(target)) {
        throw new Error('Unexpected keyup target');
      }
      ev.preventDefault();
      ev.stopPropagation();
      const fractionI = target.value.indexOf(fractionDelimiter);
      const { selectionEnd, selectionStart } = target;
      const step =
        fractionI === -1 || (selectionStart || 0) <= fractionI
          ? 1
          : fractionStep;
      const valueLength = target.value.length;
      const newValue = ev.key === 'ArrowDown' ? value - step : value + step;
      target.value = format(newValue, { thousandDelimiter: false });
      const valueDiff = target.value.length - valueLength;
      target.setSelectionRange(
        (selectionStart || 0) + valueDiff,
        (selectionEnd || 0) + valueDiff,
      );
      onInternalChange(ev as any);
    },
    [fractionDelimiter, format, fractionStep, onInternalChange, value],
  );

  return { onKeyDown: handleKeyDown, ...inputProps };
}
