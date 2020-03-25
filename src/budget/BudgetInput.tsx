import React, {
  InputHTMLAttributes,
  ChangeEvent,
  FocusEvent,
  useCallback,
  useState,
} from 'react';

export default function BudgetInput({
  onChange,
  onBlur,
  value,
  round,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  round: (amount: string) => number;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [empty, setEmpty] = useState<boolean>(false);
  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setEmpty(ev.target.value === '');
      onChange(ev);
    },
    [onChange],
  );
  const handleBlur = useCallback(
    (ev: FocusEvent<HTMLInputElement>) => {
      setEmpty(false);
      if (onBlur) {
        onBlur(ev);
      }
      if (round(ev.target.value) !== value) {
        onChange({
          ...ev,
          target: {
            ...ev.target,
            name: ev.target.name,
            value: round(ev.target.value).toString(),
          },
        });
      }
    },
    [onBlur, onChange, round, value],
  );
  return (
    <input
      type="number"
      value={empty ? '' : value}
      onChange={handleChange}
      onBlur={handleBlur}
      {...rest}
    />
  );
}
