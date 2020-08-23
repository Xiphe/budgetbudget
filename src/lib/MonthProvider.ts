import { createContext, useContext } from 'react';
import { MonthData } from '../budget';

const MonthsContext = createContext<MonthData[]>([]);
const MonthContext = createContext<MonthData | null>(null);

export const MonthsContextProvider = MonthsContext.Provider;
export const MonthContextProvider = MonthContext.Provider;

export function useMonths() {
  return useContext(MonthsContext);
}
export function useMonth() {
  const month = useContext(MonthContext);
  if (month === null) {
    throw new Error('Can not useMonth outside of MonthContextProvider');
  }
  return month;
}
