import format from 'date-fns/format';

export default function formatDateKey(date: Date) {
  return format(date, 'uuuu-MM');
}
