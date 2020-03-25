import { useCallback } from 'react';

export default function useRound<T extends any>(
  accuracy: number,
  normalizeVal?: (value: T) => number,
) {
  return useCallback(
    (value: T) =>
      Math.round((normalizeVal ? normalizeVal(value) : value) * accuracy) /
      accuracy,
    [accuracy, normalizeVal],
  );
}
