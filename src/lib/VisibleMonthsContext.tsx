import React, {
  useContext,
  createContext,
  FC,
  useState,
  useCallback,
} from 'react';

type VisibleMonthSetter = (date: Date) => () => void;
const VisibleMonthsContext = createContext<Date[]>([]);
const SetVisibleMonthsContext = createContext<null | VisibleMonthSetter>(null);

export const VisibleMothContextProvider: FC = ({ children }) => {
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
  const setVisibleMonth: VisibleMonthSetter = useCallback((date: Date) => {
    setVisibleMonths((existingMonths) => existingMonths.concat(date));
    return () => {
      setVisibleMonths((existingMonths) => {
        const index = existingMonths.findIndex((d) => d === date);
        return [
          ...existingMonths.slice(0, index),
          ...existingMonths.slice(index + 1),
        ];
      });
    };
  }, []);
  return (
    <SetVisibleMonthsContext.Provider value={setVisibleMonth}>
      <VisibleMonthsContext.Provider value={visibleMonths}>
        {children}
      </VisibleMonthsContext.Provider>
    </SetVisibleMonthsContext.Provider>
  );
};

export function useSetVisibleMonth() {
  const setter = useContext(SetVisibleMonthsContext);
  if (!setter) {
    throw new Error(
      'Unexpected use of useSetVisibleMonth outside of VisibleMothContextProvider',
    );
  }
  return setter;
}

export function useVisibleMonths() {
  const months = useContext(VisibleMonthsContext);
  if (!months) {
    throw new Error(
      'Unexpected use of useVisibleMonths outside of VisibleMothContextProvider',
    );
  }
  return months;
}
