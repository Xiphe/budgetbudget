import React from 'react';
import { Button } from '../../../components';
// import Setting from '../Setting';
import { Props } from './Types';
import IncomeCategorySelect from './IncomeCategorySelect';
import IncomeCategoryAvailableInput from './IncomeCategoryAvailableInput';
import styles from './Categories.module.scss';
import {
  ACTION_SETTINGS_REMOVE_INCOME_CATEGORY,
  ACTION_SETTINGS_ADD_INCOME_CATEGORY,
} from '../../../budget';

export default function IncomeCategorySetting({
  state,
  dispatch,
  categories,
}: Props) {
  const { incomeCategories } = state.settings;
  const incomeCategoryIds = incomeCategories.map(({ id }) => id);

  // <Setting label="Income categories">
  return (
    <>
      <ul className={styles.incomeCategories}>
        {incomeCategories.map(({ id, availableIn }) => {
          return (
            <li key={id || 'new'}>
              <Button
                className={styles.addRemoveButton}
                onClick={() =>
                  dispatch({
                    type: ACTION_SETTINGS_REMOVE_INCOME_CATEGORY,
                    payload: id,
                  })
                }
              >
                −
              </Button>
              <IncomeCategorySelect
                categoryId={id}
                categories={categories}
                incomeCategoryIds={incomeCategoryIds}
                dispatch={dispatch}
              />
              available in{' '}
              <IncomeCategoryAvailableInput
                categoryId={id}
                dispatch={dispatch}
                value={availableIn}
              />{' '}
              {availableIn === 1 ? 'month' : 'months'}
            </li>
          );
        })}
      </ul>
      {!incomeCategoryIds.includes(null) && (
        <Button
          className={styles.addRemoveButton}
          onClick={() =>
            dispatch({
              type: ACTION_SETTINGS_ADD_INCOME_CATEGORY,
            })
          }
        >
          +
        </Button>
      )}
    </>
    // </Setting>
  );
}
