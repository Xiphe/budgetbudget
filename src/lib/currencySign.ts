const SIGNS: { [k: string]: string } = {
  EUR: '€',
  USD: '$',
};

export default function currencySign(currency: string): string {
  return SIGNS[currency] || currency;
}
