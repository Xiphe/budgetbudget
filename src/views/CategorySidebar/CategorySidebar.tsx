import React, { MutableRefObject, useCallback } from 'react';
import { Sidebar, Row } from '../../components';
import { Category } from '../../moneymoney';
import styles from './CategorySidebar.module.scss';

type Props = {
  categories: Category[];
  innerRef: MutableRefObject<HTMLDivElement | null>;
  syncScrollY: MutableRefObject<HTMLDivElement | null>;
  budgetName: string;
};
export default function CategorySidebar({
  categories,
  innerRef,
  budgetName,
  syncScrollY,
}: Props) {
  const syncScroll = useCallback(
    ({ target: { scrollTop } }) => {
      if (syncScrollY.current) {
        syncScrollY.current.scrollTop = scrollTop;
      }
    },
    [syncScrollY],
  );

  let prevIndent = 0;
  let i = -1;
  return (
    <div className={styles.sidebarWrap}>
      <div className={styles.sidebarHeader}>
        <h3>{budgetName}</h3>
      </div>
      <Sidebar
        onScroll={syncScroll}
        innerRef={innerRef}
        className={styles.categorySidebar}
      >
        {categories.map(({ uuid, name, group, indentation, icon }) => {
          const groupIndentation = group ? indentation + 1 : indentation;
          const groupClosed = prevIndent > groupIndentation;
          if (group) {
            i = -1;
          } else if (groupClosed) {
            i = 0;
          } else {
            i += 1;
          }
          prevIndent = groupIndentation;

          return (
            <Row
              key={uuid}
              indent={indentation}
              leaf={!group}
              odd={!(i % 2)}
              groupClosed={groupClosed}
              className={styles.row}
            >
              {!group && (
                <span
                  style={{ backgroundImage: `url(${icon})` }}
                  className={styles.icon}
                />
              )}
              {name}
            </Row>
          );
        })}
      </Sidebar>
    </div>
  );
}
