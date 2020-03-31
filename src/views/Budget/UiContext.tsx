import React, {
  createContext,
  FC,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import classNames from 'classnames';
import styles from './UiContext.module.scss';

type UiContext = {
  registerBigHeader: () => () => void;
};
const UiContext = createContext<null | UiContext>(null);

function useBigHeader(): [boolean, UiContext['registerBigHeader']] {
  const [bigHeaders, setBigHeaders] = useState<symbol[]>([]);
  const registerBigHeader = useCallback(() => {
    const sym = Symbol();
    setBigHeaders((prevBigHeaders) => prevBigHeaders.concat(sym));
    return () => {
      setBigHeaders((prevBigHeaders) => [
        ...prevBigHeaders.slice(0, prevBigHeaders.indexOf(sym)),
        ...prevBigHeaders.slice(prevBigHeaders.indexOf(sym) + 1),
      ]);
    };
  }, []);

  return [bigHeaders.length > 0, registerBigHeader];
}

export const UiProvider: FC = ({ children }) => {
  const [hasBigHeader, registerBigHeader] = useBigHeader();

  return (
    <UiContext.Provider
      value={useMemo(() => ({ registerBigHeader }), [registerBigHeader])}
    >
      <div
        className={classNames(
          hasBigHeader ? styles.monthBigHeader : styles.monthHeader,
        )}
      >
        {children}
      </div>
    </UiContext.Provider>
  );
};

export function useUi() {
  const ui = useContext(UiContext);
  if (!ui) {
    throw new Error('Can not use useUi without UiContext.Provider');
  }
  return ui;
}
