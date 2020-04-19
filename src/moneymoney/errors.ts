export function cleanMessage(message: string) {
  const match = message.match(/Error invoking remote method .* Error: (.*)/);
  if (match) {
    return match[1];
  }
  return message;
}
export function isDatabaseLocked(message: string) {
  return message.includes('MoneyMoney database is locked');
}
export function cantFindMoneyMoney(message: string) {
  return message.includes(
    'Seems as if MoneyMoney is not installed on your mac',
  );
}
