import React, {
  ReactElement,
  useRef,
  Children,
  useMemo,
  useEffect,
} from 'react';
import debounce from 'lodash.debounce';
import styles from './InfiniteSlider.module.scss';

type Props = {
  children: ReactElement | ReactElement[];
  scrollTo: number;
  loadMore: (direction: 'left' | 'right') => void;
};

export default function InfiniteSlider({
  children,
  scrollTo,
  loadMore,
}: Props) {
  const childrenArray = Children.toArray(children) as ReactElement[];
  const keys = childrenArray.map(({ key }) => key).join('_');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstChildRef = useRef(childrenArray[0].key);
  const onScroll = useMemo(
    () =>
      debounce(
        () => {
          const container = containerRef.current;
          if (!container) {
            return;
          }

          if (container.scrollLeft === 0) {
            loadMore('left');
          } else if (
            container.getBoundingClientRect().width + container.scrollLeft ===
            container.scrollWidth
          ) {
            loadMore('right');
          }
        },
        100,
        { leading: false },
      ),
    [loadMore],
  );
  /** Do not jump when new children are added to the left */
  useEffect(() => {
    const first = childrenArray[0].key;
    const container = containerRef.current;
    if (!container || first === firstChildRef.current) {
      return;
    }
    const index = childrenArray.findIndex(
      ({ key }) => key === firstChildRef.current,
    );
    firstChildRef.current = first;
    if (index === -1) {
      return;
    }
    const target = container.children[index] as HTMLElement;
    if (!target) {
      return;
    }
    container.scrollLeft = target.offsetLeft;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [keys]);
  /** Scroll to given index */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const target = container.children[scrollTo] as HTMLElement;
    if (target) {
      container.scrollLeft = target.offsetLeft;
    }
  }, [scrollTo]);

  return (
    <div ref={containerRef} className={styles.slider} onScroll={onScroll}>
      {children}
    </div>
  );
}
