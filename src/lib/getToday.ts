export default function getToday() {
  if (process.env.NODE_ENV === 'test' || process.env.REACT_APP_ENV === 'test') {
    return new Date('2019-07-07');
  }

  return new Date();
}
