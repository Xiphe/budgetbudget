import React, {
  ReactElement,
  useMemo,
  useEffect,
  MutableRefObject,
  useCallback,
} from 'react';
import classNames from 'classnames';
import styles from './InfiniteSlider.module.scss';
import { useVisibilityObserver, IsVisibleProvider } from '../../lib';

type Props = {
  innerRef: MutableRefObject<HTMLDivElement | null>;
  syncScrollY: MutableRefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactElement | ReactElement[];
  scrollTo: number;
  loadMore: () => void;
};

const INTERSECTION_THRESHOLD = 0.01;
const LOAD_MORE_THRESHOLD = 500;

export default function InfiniteSlider({
  children,
  innerRef: containerRef,
  scrollTo,
  loadMore,
  syncScrollY,
  className,
}: Props) {
  const onScroll = useCallback(
    (ev) => {
      const { target } = ev;
      if (syncScrollY.current) {
        syncScrollY.current.scrollTop = target.scrollTop;
      }

      if (
        target.getBoundingClientRect().width + target.scrollLeft >
        target.scrollWidth - LOAD_MORE_THRESHOLD
      ) {
        loadMore();
      }
    },
    [loadMore, syncScrollY],
  );

  /** Scroll to given index */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const target = container.children[scrollTo] as HTMLElement;
    if (target) {
      container.scrollLeft = target.getBoundingClientRect().width * scrollTo;
    }
  }, [scrollTo, containerRef]);

  const isVisible = useVisibilityObserver(
    useMemo(
      () => ({
        rootMargin: `0px`,
        threshold: INTERSECTION_THRESHOLD,
        root: containerRef.current!,
      }),
      [containerRef],
    ),
  );

  return (
    <div
      ref={containerRef}
      className={classNames(className, styles.slider)}
      onScroll={onScroll}
    >
      <IsVisibleProvider value={isVisible}>{children}</IsVisibleProvider>
    </div>
  );
}
