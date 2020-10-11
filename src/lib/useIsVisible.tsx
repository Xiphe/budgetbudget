import {
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';

type IsVisibleCallback = (visible: boolean) => void;

const IsVisibleContext = createContext<
  ((element: Element, callback: IsVisibleCallback) => void) | null
>(null);

export const IsVisibleProvider = IsVisibleContext.Provider;

export function useVisibilityObserver(
  init: Omit<IntersectionObserverInit, 'threshold'> & {
    threshold: number;
  },
) {
  const visibilityChildrenRef = useRef(new Map<Element, IsVisibleCallback>());
  const obs = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const cb = visibilityChildrenRef.current.get(entry.target);
          if (cb) {
            cb(entry.intersectionRatio > (init.threshold || 0));
          }
        });
      }, init),
    [init],
  );
  const registerVisibilityChildren = useCallback(
    (element: Element, callback: IsVisibleCallback) => {
      visibilityChildrenRef.current!.set(element, callback);
      obs.observe(element);
      return () => {
        obs.unobserve(element);
        visibilityChildrenRef.current!.delete(element);
      };
    },
    [obs],
  );
  useEffect(() => {
    Array.from(visibilityChildrenRef.current.keys()).forEach(
      obs.observe.bind(obs),
    );

    return () => obs.disconnect();
  }, [obs]);

  return registerVisibilityChildren;
}

export function useIsVisible() {
  return useContext(IsVisibleContext);
}
