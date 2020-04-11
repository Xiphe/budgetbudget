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
  const cleanPattern = new RegExp(`[^-+0-9${fractionDelimiter}]`, 'g');

  return {
    fractionStep,
    fractionDelimiter,
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
