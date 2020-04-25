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

export type ScrollTo = (scrollTo: number, behaviour?: ScrollBehavior) => void;

type Props = {
  innerRef: MutableRefObject<HTMLDivElement | null>;
  syncScrollY: MutableRefObject<HTMLDivElement | null>;
  getScrollTo?: (scrollTo: ScrollTo) => void;
  className?: string;
  onScrollRef?: MutableRefObject<((target: HTMLDivElement) => void) | null>;
  children: ReactElement | ReactElement[];
  loadMore: () => void;
};

const INTERSECTION_THRESHOLD = 0.01;
const LOAD_MORE_THRESHOLD = 500;

export default function InfiniteSlider({
  children,
  innerRef: containerRef,
  getScrollTo,
  loadMore,
  syncScrollY,
  onScrollRef,
  className,
}: Props) {
  useEffect(() => {
    if (getScrollTo) {
      getScrollTo(
        () => (scrollTo: number, behaviour: ScrollBehavior = 'smooth') => {
          const container = containerRef.current;
          if (!container) {
            return;
          }
          const target = container.children[scrollTo] as HTMLElement;
          if (target) {
            window.requestAnimationFrame(() => {
              target.scrollIntoView({ behaviour, inline: 'start' } as any);
            });
          }
        },
      );
    }
  }, [getScrollTo, containerRef]);

  const onScroll = useCallback(
    (ev) => {
      const { target } = ev;
      if (syncScrollY.current) {
        syncScrollY.current.scrollTop = target.scrollTop;
      }
      if (onScrollRef && onScrollRef.current) {
        onScrollRef.current(target);
      }

      if (
        target.getBoundingClientRect().width + target.scrollLeft >
        target.scrollWidth - LOAD_MORE_THRESHOLD
      ) {
        loadMore();
      }
    },
    [loadMore, syncScrollY, onScrollRef],
  );

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
