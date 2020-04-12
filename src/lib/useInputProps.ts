import { useState, useCallback } from 'react';

function noop(v: any) {
  return v;
}
type UseInputConfig<V, E> = {
  value: V;
  toInputFormat?: (value: V) => any;
  internal?: boolean;
  format?: (value: V) => any;
  onChange: (value: V) => void;
  validate: (ev: E, setError: (error: string | null) => void) => V;
};
const EMPTY = Symbol('EMPTY');

export default function useInputProps<
  V extends any,
  E extends { target: { value: any } }
>({
  value,
  onChange,
  validate,
  toInputFormat = noop,
  format = noop,
  internal = true,
}: UseInputConfig<V, E>) {
  const [internalValue, setValue] = useState<any>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  return {
    value: internalValue !== EMPTY ? internalValue : format(value),
    error,
    onFocus: useCallback(() => {
      if (internal) {
        setValue(toInputFormat(value));
      }
    }, [internal, value, toInputFormat]),
    onBlur: useCallback(() => {
      if (internal) {
        setValue(EMPTY);
        setError(null);
      }
    }, [internal]),
    onChange: useCallback(
      (ev: E) => {
        if (internal) {
          setValue(ev.target.value);
        }
        try {
          setError(null);
          onChange(validate(ev, setError));
        } catch (err) {
          setError(err.message || err);
        }
      },
      [onChange, validate, internal],
    ),
  };
}
