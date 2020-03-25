export default function roundWithFractions(fractionDigits: number) {
  const roundWith = Math.pow(10, fractionDigits);
  return (value: number) => Math.round(value * roundWith) / roundWith;
}
