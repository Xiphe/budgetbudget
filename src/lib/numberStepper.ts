import { KeyboardEvent } from 'react';
import { NumberFormatter } from './NumberFormatter';
import { DATE_INPUT_RGX } from './parseBudgetInput';
import parseISO from 'date-fns/parseISO';
import addYears from 'date-fns/addYears';
import subYears from 'date-fns/subYears';
import formatDate from 'date-fns/format';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';

function isHTMLInputElement(elm: any): elm is HTMLInputElement {
  return elm instanceof HTMLInputElement;
}

function updateDate(date: Date, month: boolean, add: boolean) {
  if (month && add) {
    return addMonths(date, 1);
  } else if (month) {
    return subMonths(date, 1);
  } else if (add) {
    return addYears(date, 1);
  }
  return subYears(date, 1);
}

function updateValue(
  val: string,
  selectionStart: number,
  selectionEnd: number,
  key: string,
  { parse, format, fractionDelimiter, fractionStep }: NumberFormatter,
): string {
  if (val.match(DATE_INPUT_RGX)) {
    return formatDate(
      updateDate(parseISO(val), selectionStart > 4, key !== 'ArrowDown'),
      'yyyy-MM',
    );
  }
  const numericValue = parse(val);
  const fractionDelimiterIndex = val.indexOf(fractionDelimiter);
  const isFloat = fractionDelimiterIndex !== -1;
  const step =
    isFloat && selectionStart > fractionDelimiterIndex ? fractionStep : 1;

  const updatedNumericValue =
    key === 'ArrowDown' ? numericValue - step : numericValue + step;
  return isFloat
    ? format(updatedNumericValue, {
        thousandDelimiter: false,
      })
    : String(updatedNumericValue);
}

export function createNumberStepper(
  numberFormatter: NumberFormatter,
  onChange: (ev: { target: { value: any } }) => void,
) {
  return (ev: KeyboardEvent<HTMLInputElement>) => {
    if (
      ev.defaultPrevented ||
      (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp')
    ) {
      return;
    }

    const target = ev.target;
    if (!isHTMLInputElement(target)) {
      throw new Error('Unexpected keyup target');
    }
    const {
      selectionStart: _strt,
      selectionEnd: _end,
      value: allValue,
    } = target;
    const selectionStart = _strt || 0;
    const selectionEnd = _end || 0;

    const NUMBERS_RGX = new RegExp(
      `[0-9]{4}-[0-9]{1,2}|-?([0-9][${numberFormatter.delimiters.join()}[0-9]+[0-9]|[0-9]+)`,
      'g',
    );
    let m: RegExpExecArray | null;
    /* eslint-disable-next-line no-cond-assign */
    while (
      (m = NUMBERS_RGX.exec(allValue)) &&
      (selectionStart < m.index || selectionStart > m.index + m[0].length)
    ) {
      /* continue */
    }
    if (!m) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();

    const updatedValue = updateValue(
      m[0],
      selectionStart - m.index,
      selectionEnd - m.index,
      ev.key,
      numberFormatter,
    );

    const newValue = [
      allValue.substr(0, m.index),
      updatedValue,
      allValue.substr(m.index + m[0].length),
    ].join('');

    const valDiff = updatedValue.length - m[0].length;

    target.value = newValue;
    onChange(ev as any);
    target.setSelectionRange(selectionStart, selectionEnd + valDiff);
  };
}
