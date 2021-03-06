import React, {
  useMemo,
  Fragment,
  useRef,
  useEffect,
  MutableRefObject,
  useCallback,
} from 'react';
import classNames from 'classnames';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import { Header } from '../../components';
import { useVisibleMonths, formatDateKey, useMonths, getToday } from '../../lib';
import styles from './Budget.module.scss';

type Props = {
  onClick: (key: string) => void;
  scrollRef: MutableRefObject<((target: HTMLDivElement) => void) | null>;
};

function isHTMLElement(target: EventTarget): target is HTMLElement {
  return typeof (target as any).nodeName === 'string';
}

function isHTMLButtonElement(elm: HTMLElement): elm is HTMLButtonElement {
  return elm.nodeName === 'BUTTON';
}

function findButton(
  target: EventTarget | HTMLElement | null,
): null | HTMLButtonElement {
  if (!target || !isHTMLElement(target)) {
    return null;
  }
  if (isHTMLButtonElement(target)) {
    return target;
  }
  return findButton(target.parentElement);
}

export default function BudgetHeader({ scrollRef, onClick }: Props) {
  const months: { date: Date; key: string }[] = useMonths();
  const handleClick = useCallback(
    ({ target }: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const button = findButton(target);
      if (button) {
        onClick(button.name);
      }
    },
    [onClick],
  );
  const headerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current = (target) => {
      window.requestAnimationFrame(() => {
        if (headerRef.current === null) {
          return;
        }
        const outer = headerRef.current;
        const inner: HTMLDivElement = headerRef.current.children[0] as any;
        const scrollViewWidth = target.getBoundingClientRect().width;
        const scrollItemWidth = target.children[0].getBoundingClientRect()
          .width;
        const visibleItems = scrollViewWidth / scrollItemWidth;
        const scrolled =
          target.scrollLeft / target.children[0].getBoundingClientRect().width;
        const outerWidth = outer.getBoundingClientRect().width;

        const firstMonth: HTMLSpanElement = inner.children[1] as any;
        const oneYearLater: HTMLSpanElement = inner.children[14] as any;
        const oneYearWidth = oneYearLater.offsetLeft - firstMonth.offsetLeft;
        const oneMonthWidth = oneYearWidth / 12;

        /* keep visible months in center unless were at the start */
        inner.style.left = `-${Math.max(
          oneMonthWidth * scrolled -
            outerWidth / 2 +
            oneMonthWidth +
            (oneMonthWidth / 2) * (visibleItems - 1),
          0,
        )}px`;
      });
    };
  }, [scrollRef]);
  const moreMonths = useMemo(() => {
    if (!months.length) {
      return [];
    }
    let add = addMonths(months[months.length - 1].date, 1);
    return months.concat(
      Array(13)
        .fill('')
        .map(() => {
          const more = {
            date: add,
            key: formatDateKey(add),
          };
          add = addMonths(add, 1);
          return more;
        }),
    );
  }, [months]);
  const visibleMonths = useVisibleMonths();
  const visibleMonthKeys = useMemo(() => visibleMonths.map(formatDateKey), [
    visibleMonths,
  ]);

  if (!moreMonths.length) {
    return <Header />;
  }

  const first = moreMonths[0].date;

  return (
    <Header>
      <div className={styles.monthList} ref={headerRef}>
        <div className={styles.monthListInner}>
          {moreMonths.map(({ date, key }) => (
            <Fragment key={key}>
              {date === first || date.getMonth() === 0 ? (
                <span
                  className={classNames(
                    styles.monthListEntry,
                    styles.monthListEntryYear,
                  )}
                >
                  {format(date, 'yyyy')}
                </span>
              ) : null}
              <button
                name={key}
                className={classNames(
                  styles.monthListEntry,
                  visibleMonthKeys.includes(key) &&
                    styles.currentMonthListEntry,
                )}
                onClick={handleClick}
              >
                {format(date, 'MMM')}
              </button>
            </Fragment>
          ))}
        </div>
      </div>
      <button
        name={formatDateKey(getToday())}
        className={styles.todayButton}
        onClick={handleClick}
      >
        Today
      </button>
    </Header>
  );
}
