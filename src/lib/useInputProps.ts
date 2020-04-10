import { useState, useCallback, ChangeEvent } from 'react';

function noop(v: any) {
  return v;
}
type UseInputConfig<V, E> = {
  value: V;
  toInputFormat?: (value: V) => any;
  format?: (value: V) => any;
  onChange: (value: V) => void;
  validate: (ev: E) => V;
};
const EMPTY = Symbol('EMPTY');
export const SET_INTERNAL = Symbol('SET_INTERNAL');
export default function useInputProps<
  V extends any,
  E extends ChangeEvent<HTMLInputElement>
>({
  value,
  onChange,
  validate,
  toInputFormat = noop,
  format = noop,
}: UseInputConfig<V, E>) {
  const [internalValue, setValue] = useState<any>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  return {
    value: internalValue !== EMPTY ? internalValue : format(value),
    error,
    onFocus: useCallback(() => setValue(toInputFormat(value)), [
      value,
      toInputFormat,
    ]),
    onBlur: useCallback(() => {
      setValue(EMPTY);
      setError(null);
    }, []),
    onChange: useCallback(
      (ev: E) => {
        setValue(ev.target.value);
        try {
          onChange(validate(ev));
          setError(null);
        } catch (err) {
          setError(err.message || err);
        }
      },
      [onChange, validate],
    ),
  };
}
