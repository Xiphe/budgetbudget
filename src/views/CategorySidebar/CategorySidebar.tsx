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
        {categories.map(({ uuid, name, group, indentation, icon }) => (
          <Row
            key={uuid}
            indent={indentation}
            leaf={!group}
            className={styles.row}
          >
            <span
              style={{ backgroundImage: `url(${icon})` }}
              className={styles.icon}
            />
            {name}
          </Row>
        ))}
      </Sidebar>
    </div>
  );
}
