import { useState, useCallback } from 'react';

function noop(v: any) {
  return v;
}
const EMPTY = Symbol('EMPTY');

type Event = { target: { value: any } };

type UseInputConfig<V> = {
  value: V;
  toInputFormat?: (value: V) => any;
  internal?: boolean;
  format?: (value: V) => any;
  onChange: (value: V) => void;
  validate: (ev: Event, setError: (error: string | null) => void) => V;
};

export default function useInputProps<V extends any>({
  value,
  onChange,
  validate,
  toInputFormat = noop,
  format = noop,
  internal = true,
}: UseInputConfig<V>) {
  const [internalValue, setValue] = useState<any>(EMPTY);
  const [error, setError] = useState<string | null>(() => {
    try {
      let err = null;
      validate({ target: { value: value } }, (error) => (err = error));
      return err;
    } catch (err) {
      return err.message;
    }
  });

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
      (ev: Event) => {
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
