export function optional<T extends (data: unknown) => data is any>(
  data: unknown,
  checker: T,
): data is undefined | ReturnType<T> {
  return data === undefined || checker(data);
}
export function isString(data: unknown): data is string {
  return typeof data === 'string';
}
export function isObject(data: unknown): data is { [key: string]: unknown } {
  return typeof data === 'object' && data !== null;
}
export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && !data.some((elm) => typeof elm !== 'string');
}
