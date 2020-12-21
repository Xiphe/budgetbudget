import { NumberFormatter } from '../../NumberFormatter';

const ni = () => {
  throw new Error('Not Implemented');
};
export function createNumberFormatter({
  fractionStep = 0.1,
  fractionDelimiter = '.',
  delimiters = [',', '.'],
  format = ni,
  parse = ni,
}: Partial<NumberFormatter> = {}): NumberFormatter {
  return {
    fractionDelimiter,
    fractionStep,
    delimiters,
    format,
    parse,
  };
}
