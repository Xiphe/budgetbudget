import React, {
  createContext,
  FC,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';

type RegisterHeaderHeight = (id: number, header: HTMLElement | null) => void;
const HeaderHeightContext = createContext<null | RegisterHeaderHeight>(null);

export const HeaderHeightProvider: FC = ({ children }) => {
  const headers = useRef<{ [k: number]: HTMLElement }>({});
  const [height, setHeight] = useState<number>(0);
  const observer = useMemo(
    () =>
      new ResizeObserver(() => {
        requestAnimationFrame(() => {
          setHeight(
            Math.max(
              0,
              ...Object.values(headers.current).map(
                (elm) => elm.getBoundingClientRect().height,
              ),
            ),
          );
        });
      }),
    [setHeight],
  );
  const registerHeader = useCallback<RegisterHeaderHeight>(
    (id, header) => {
      if (headers.current[id] === header) {
        return;
      }
      if (header === null) {
        observer.unobserve(headers.current[id]);
        delete headers.current[id];
        return;
      }
      observer.observe(header);
      headers.current[id] = header;
    },
    [headers, observer],
  );

  return (
    <HeaderHeightContext.Provider value={registerHeader}>
      <div style={{ '--month-header-height': `${height}px` } as any}>
        {children}
      </div>
    </HeaderHeightContext.Provider>
  );
};

let i = 0;
export function useRegisterHeader() {
  const id = useMemo(() => i++, []);
  const registerHeader = useContext(HeaderHeightContext);
  const callback = useCallback(
    (elm: HTMLElement | null) => {
      registerHeader!(id, elm);
    },
    [registerHeader, id],
  );
  if (!registerHeader) {
    throw new Error(
      'Can not use useRegisterHeader without HeaderHeightContext.Provider',
    );
  }
  return callback;
}
