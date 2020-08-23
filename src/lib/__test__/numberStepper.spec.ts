import React from 'react';
import { createNumberFormatter } from './factories';
import { createNumberStepper } from '../numberStepper';

function createKeydownEvent(
  overwrites: Partial<HTMLInputElement> = {},
  keyboardEventInit: KeyboardEventInit = {},
): Omit<React.KeyboardEvent<HTMLInputElement>, 'target'> & {
  target: HTMLInputElement;
} {
  const target = Object.assign(
    {
      value: '',
      selectionStart: 0,
      selectionEnd: 0,
      setSelectionRange(start: number, end: number) {
        this.selectionStart = start;
        this.selectionEnd = end;
      },
    },
    overwrites,
  );
  Object.setPrototypeOf(target, HTMLInputElement.prototype);

  const ev = new KeyboardEvent('keydown', keyboardEventInit);
  Object.defineProperty(ev, 'target', { writable: false, value: target });
  Object.defineProperty(ev, 'preventDefault', {
    writable: false,
    value() {
      Object.defineProperty(ev, 'defaultPrevented', {
        writable: false,
        value: true,
      });
    },
  });

  return ev as any;
}

describe('numberStepper', () => {
  const numberFormatter = createNumberFormatter({
    delimiters: [',', '.'],
    fractionDelimiter: ',',
    fractionStep: 0.01,
    parse(input) {
      return parseFloat(input.replace(/\./g, '').replace(',', '.'));
    },
    format(value) {
      let [dez, frac = ''] = String(value).split('.');
      while (frac.length < 2) {
        frac += '0';
      }

      return [dez, frac].join(',');
    },
  });
  const stepNumber = createNumberStepper(numberFormatter, jest.fn());

  it('does nothing when default is prevented', () => {
    const ev = createKeydownEvent({ value: '1234' }, { key: 'ArrowDown' });
    ev.preventDefault();

    stepNumber(ev);

    expect(ev.target.value).toBe('1234');
  });

  it('does nothing when another key is pressed', () => {
    const ev = createKeydownEvent({ value: '1234' }, { key: 'Enter' });

    stepNumber(ev);

    expect(ev.target.value).toBe('1234');
  });

  it('increases plain number', () => {
    const ev = createKeydownEvent({ value: '1' }, { key: 'ArrowUp' });

    stepNumber(ev);

    expect(ev.target.value).toBe('2');
  });

  it('decreases plain number', () => {
    const ev = createKeydownEvent({ value: '1' }, { key: 'ArrowDown' });

    stepNumber(ev);

    expect(ev.target.value).toBe('0');
  });

  it('increases float', () => {
    const ev = createKeydownEvent({ value: '1,20' }, { key: 'ArrowUp' });

    stepNumber(ev);

    expect(ev.target.value).toBe('2,20');
  });

  it('increases float fraction', () => {
    const ev = createKeydownEvent(
      { value: '1,20', selectionStart: 2, selectionEnd: 2 },
      { key: 'ArrowUp' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe('1,21');
  });

  it('expands selection when numbers get bigger', () => {
    const ev = createKeydownEvent(
      { value: '9', selectionStart: 0, selectionEnd: 1 },
      { key: 'ArrowUp' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe('10');
    expect(ev.target.selectionStart).toBe(0);
    expect(ev.target.selectionEnd).toBe(2);
  });

  it('shrinks selection when numbers get smaller', () => {
    const ev = createKeydownEvent(
      { value: '10', selectionStart: 0, selectionEnd: 2 },
      { key: 'ArrowDown' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe('9');
    expect(ev.target.selectionStart).toBe(0);
    expect(ev.target.selectionEnd).toBe(1);
  });

  it('manipulates numbers in mixed values', () => {
    const ev = createKeydownEvent(
      {
        value: `(budgeted() + 200) * 0,16`,
        selectionStart: 15,
        selectionEnd: 15,
      },
      { key: 'ArrowDown' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe('(budgeted() + 199) * 0,16');
  });

  it('does nothing when no number is in selection', () => {
    const ev = createKeydownEvent(
      {
        value: `budgeted() + 200`,
        selectionStart: 0,
        selectionEnd: 8,
      },
      { key: 'ArrowDown' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe('budgeted() + 200');
  });

  it('calls onChange when value changes', () => {
    const ev = createKeydownEvent({ value: '0' }, { key: 'ArrowDown' });
    const spy = jest.fn();
    createNumberStepper(numberFormatter, spy)(ev);

    expect(spy).toHaveBeenCalledWith(ev);
    expect(ev.target.value).toBe('-1');
  });

  it('steps dates down by year', () => {
    const ev = createKeydownEvent(
      {
        value: `budgeted('2000-01')`,
        selectionStart: 12,
        selectionEnd: 12,
      },
      { key: 'ArrowDown' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe(`budgeted('1999-01')`);
  });

  it('steps dates up by year', () => {
    const ev = createKeydownEvent(
      {
        value: `2020-12`,
        selectionStart: 0,
        selectionEnd: 0,
      },
      { key: 'ArrowUp' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe(`2021-12`);
  });

  it('steps dates by month', () => {
    const ev = createKeydownEvent(
      {
        value: `budgeted('2000-01')`,
        selectionStart: 15,
        selectionEnd: 15,
      },
      { key: 'ArrowDown' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe(`budgeted('1999-12')`);
  });

  it('steps dates up month', () => {
    const ev = createKeydownEvent(
      {
        value: `2020-12`,
        selectionStart: 6,
        selectionEnd: 6,
      },
      { key: 'ArrowUp' },
    );

    stepNumber(ev);

    expect(ev.target.value).toBe(`2021-01`);
  });
});
