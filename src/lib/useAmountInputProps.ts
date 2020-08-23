import { useCallback, useMemo } from 'react';
import { NumberFormatter } from './createNumberFormatter';
import { createNumberStepper } from './numberStepper';
import useInputProps from './useInputProps';

type CurrencyInputConfig = {
  value: number;
  onKeyDown?: (ev: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (value: number) => void;
  parse?: (value: string) => number;
  numberFormatter: NumberFormatter;
};
export default function useCurrencyInput({
  value,
  onChange,
  onKeyDown,
  numberFormatter,
  parse = numberFormatter.parse,
}: CurrencyInputConfig) {
  const { format } = numberFormatter;
  const { error: _, ...inputProps } = useInputProps<number>({
    value,
    onChange: onChange,
    applyLive: useCallback((ev): boolean => {
      return (
        typeof ev.target.value === 'string' &&
        ev.target.value.match(/[a-z=]/i) === null
      );
    }, []),
    validate: useCallback(
      (ev) => {
        if (typeof ev.target.value !== 'string') {
          throw new Error('Unexpected non-string input value');
        }

        return parse(ev.target.value);
      },
      [parse],
    ),
    toInputFormat: useCallback(
      (value) => format(value, { thousandDelimiter: false }),
      [format],
    ),
    format,
  });
  const onInternalChange = inputProps.onChange;
  const numberStepper = useMemo(
    () => createNumberStepper(numberFormatter, onInternalChange),
    [numberFormatter, onInternalChange],
  );
  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) {
        onKeyDown(ev);
      }
      numberStepper(ev);
    },
    [numberStepper, onKeyDown],
  );

  return { onKeyDown: handleKeyDown, ...inputProps };
}
