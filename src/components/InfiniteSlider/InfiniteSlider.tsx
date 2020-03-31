import React, {
  ReactNode,
  ReactElement,
  useRef,
  Children,
  useMemo,
  useEffect,
  useState,
} from 'react';
import debounce from 'lodash.debounce';
import styles from './InfiniteSlider.module.scss';
import { useVisibilityObserver, IsVisibleProvider } from '../../lib';

type Props = {
  children: ReactElement | ReactElement[];
  scrollTo: number;
  sticky: ReactNode;
  loadMore: (direction: 'left' | 'right') => void;
};

const INTERSECTION_THRESHOLD = 0.01;

export default function InfiniteSlider({
  children,
  scrollTo,
  loadMore,
  sticky,
}: Props) {
  const [stickyWidth, setStickyWidth] = useState<number>(0);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setStickyWidth(stickyRef.current!.getBoundingClientRect().width);
    });
    observer.observe(stickyRef.current!);

    return () => observer.disconnect();
  }, []);
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
  useEffect(() => {
    /* fix scroll offset */
    containerRef.current!.scrollLeft += stickyWidth;
  }, [stickyWidth]);
  const isVisible = useVisibilityObserver(
    useMemo(
      () => ({
        rootMargin: `0px 0px 0px -${stickyWidth}px`,
        threshold: INTERSECTION_THRESHOLD,
        root: containerRef.current!,
      }),
      [stickyWidth],
    ),
  );

  return (
    <div
      ref={containerRef}
      style={{ '--sticky-width': `${stickyWidth}px` } as any}
      className={styles.slider}
      onScroll={onScroll}
    >
      <IsVisibleProvider value={isVisible}>
        <div ref={stickyRef} className={styles.stickyLeft}>
          {sticky}
        </div>
        {children}
      </IsVisibleProvider>
    </div>
  );
}
