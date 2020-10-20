import { remote, ipcRenderer } from 'electron';
import { useEffect, useMemo, useState } from 'react';

type FormatOptions = {
  thousandDelimiter?: boolean;
  withFractions?: boolean;
};
export default function createNumberFormatter(
  fractionDigits: number,
  locale: string,
) {
  const fractionStep = 1 / Math.pow(10, fractionDigits);
  const formatter = Intl.NumberFormat(locale);
  const formatterWithFraction = Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const fractionDelimiter = formatter.format(1.1).charAt(1);
  const delimiters = Array.from(
    new Set(
      formatter
        .format(99999999)
        .replace(/9/g, '')
        .split('')
        .join(fractionDelimiter),
    ),
  );
  const cleanPattern = new RegExp(`[^-+0-9${fractionDelimiter}]`, 'g');

  return {
    fractionStep,
    fractionDelimiter,
    delimiters,
    format(
      value: number,
      { thousandDelimiter = true, withFractions = true }: FormatOptions = {},
    ): string {
      const val = (withFractions ? formatterWithFraction : formatter).format(
        value,
      );

      if (!thousandDelimiter) {
        return val.replace(cleanPattern, '');
      }

      return val;
    },
    parse(value: string) {
      return parseFloat(
        value
          .replace(cleanPattern, '')
          .replace(fractionDelimiter, '.')
          .replace(/[-+.]$/, '') || '0',
      );
    },
  };
}

export type NumberFormatter = ReturnType<typeof createNumberFormatter>;

export function useNumberFormatter(fractionDigits: number) {
  const [localeCC, setLocaleCC] = useState(() =>
    remote.app.getLocaleCountryCode(),
  );
  useEffect(() => {
    const handler = () => {
      setLocaleCC(remote.app.getLocaleCountryCode());
    };
    ipcRenderer.addListener('UPDATE_LOCALE_COUNTRY_CODE', handler);
    return () => {
      ipcRenderer.removeListener('UPDATE_LOCALE_COUNTRY_CODE', handler);
    };
  }, []);

  return useMemo(() => createNumberFormatter(fractionDigits, localeCC), [
    fractionDigits,
    localeCC,
  ]);
}
