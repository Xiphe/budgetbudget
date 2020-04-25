import React, { Fragment, MutableRefObject, useCallback } from 'react';
import { Sidebar, Row } from '../../components';
import { CategoryTree, isCategory } from '../../moneymoney';
import styles from './CategorySidebar.module.scss';

type SidebarCategoriesProps = {
  categories: CategoryTree[];
  indent?: number;
};
function SidebarCategories({ categories, indent = 0 }: SidebarCategoriesProps) {
  return (
    <>
      {categories.map((tree) => {
        return (
          <Fragment key={isCategory(tree) ? tree.id : tree.name}>
            <Row indent={indent} leaf={isCategory(tree)} className={styles.row}>
              {tree.name}
            </Row>
            {!isCategory(tree) && (
              <SidebarCategories
                categories={tree.children}
                indent={indent + 1}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

type Props = {
  categories: CategoryTree[];
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
        <SidebarCategories categories={categories} />
      </Sidebar>
    </div>
  );
}
