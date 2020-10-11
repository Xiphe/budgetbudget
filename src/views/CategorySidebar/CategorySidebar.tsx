import React, { MutableRefObject, useCallback, Dispatch } from 'react';
import { Sidebar, Row } from '../../components';
import { Category } from '../../moneymoney';
import styles from './CategorySidebar.module.scss';
import { Action, ACTION_SETTINGS_SET_CATEGORY_COLLAPSED } from '../../budget';
import { mapCategories, useSyncScrollY } from '../../lib';

type Props = {
  categories: Category[];
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  syncScrollY?: MutableRefObject<HTMLDivElement | null>;
  collapsedCategories?: string[];
  dispatch: Dispatch<Action>;
};
export default function CategorySidebar({
  categories,
  innerRef,
  collapsedCategories = [],
  dispatch,
  syncScrollY,
}: Props) {
  const syncScroll = useSyncScrollY(syncScrollY);
  const showCategory = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      dispatch({
        type: ACTION_SETTINGS_SET_CATEGORY_COLLAPSED,
        payload: {
          id: (ev.target as HTMLButtonElement).name,
          collapsed: false,
        },
      });
    },
    [dispatch],
  );
  const hideCategory = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      dispatch({
        type: ACTION_SETTINGS_SET_CATEGORY_COLLAPSED,
        payload: {
          id: (ev.target as HTMLButtonElement).name,
          collapsed: true,
        },
      });
    },
    [dispatch],
  );

  return (
    <Sidebar
      onScroll={syncScroll}
      innerRef={innerRef}
      className={styles.categorySidebar}
    >
      {mapCategories(
        categories,
        collapsedCategories,
        ({ uuid, name, group, indentation, icon }, i, groupClosed) => {
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
              <span className={styles.title}>{name}</span>
              {group && (
                <>
                  <span className={styles.spacer} />
                  {collapsedCategories.includes(uuid) ? (
                    <button
                      className={styles.showHide}
                      name={uuid}
                      onClick={showCategory}
                    >
                      Show
                    </button>
                  ) : (
                    <button
                      className={styles.showHide}
                      name={uuid}
                      onClick={hideCategory}
                    >
                      Hide
                    </button>
                  )}
                </>
              )}
            </Row>
          );
        },
      )}
    </Sidebar>
  );
}
