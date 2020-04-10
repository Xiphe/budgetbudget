import React, {
  createContext,
  FC,
  useContext,
  useState,
  useCallback,
} from 'react';

type HeaderHeight = (height: number) => () => void;
const HeaderHeightContext = createContext<null | HeaderHeight>(null);

function useHeaderHeight(): [number, HeaderHeight] {
  const [headerHeights, setHeaderHeights] = useState<number[]>([]);
  const registerBigHeader = useCallback((height: number) => {
    setHeaderHeights((prevBigHeaders) => prevBigHeaders.concat(height));
    return () => {
      setHeaderHeights((prevBigHeaders) => {
        const index = prevBigHeaders.indexOf(height);
        return [
          ...prevBigHeaders.slice(0, index),
          ...prevBigHeaders.slice(index + 1),
        ];
      });
    };
  }, []);

  return [Math.max(...headerHeights), registerBigHeader];
}

export const HeaderHeightProvider: FC = ({ children }) => {
  const [headerHeight, registerHeaderHeight] = useHeaderHeight();

  return (
    <HeaderHeightContext.Provider value={registerHeaderHeight}>
      <div style={{ '--month-header-height': `${headerHeight}px` } as any}>
        {children}
      </div>
    </HeaderHeightContext.Provider>
  );
};

export function useRegisterHeaderHeight() {
  const registerHeaderHeight = useContext(HeaderHeightContext);
  if (!registerHeaderHeight) {
    throw new Error(
      'Can not use useRegisterHeaderHeight without HeaderHeightContext.Provider',
    );
  }
  return registerHeaderHeight;
}
