import React, { useCallback } from 'react';
import { Props as P } from './Types';
import { Category } from '../../../moneymoney';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_UPDATE_INCOME_CATEGORY } from '../../../budget';
import { Select } from '../../../components';
import styles from './Categories.module.scss';

type Props = {
  dispatch: P['dispatch'];
  categoryId: number | null;
  incomeCategoryIds: (number | null)[];
  categories: Category[];
};

function validate({ target: { value } }: { target: { value: string } }) {
  return parseInt(value, 10);
}

export default function IncomeCategorySelect({
  categoryId,
  incomeCategoryIds,
  categories,
  dispatch,
}: Props) {
  const inputProps = useInputProps({
    internal: false,
    value: categoryId,
    validate,
    onChange: useCallback(
      (value: number | null) => {
        dispatch({
          type: ACTION_SETTINGS_UPDATE_INCOME_CATEGORY,
          payload: {
            oldCategoryId: categoryId,
            categoryId: value,
          },
        });
      },
      [categoryId, dispatch],
    ),
  });
  let found = false;

  return (
    <Select {...inputProps} className={styles.incomeCategorySelect}>
      {!categoryId && <option value="new">- please select -</option>}
      {categories.map(({ id, name }) => {
        if (categoryId !== id && incomeCategoryIds.includes(id)) {
          return null;
        }
        if (categoryId === id) {
          found = true;
        }
        return (
          <option key={id} value={id}>
            {name}
          </option>
        );
      })}
      {!found && categoryId && (
        <option value={categoryId}>- currently unused -</option>
      )}
    </Select>
  );
}
