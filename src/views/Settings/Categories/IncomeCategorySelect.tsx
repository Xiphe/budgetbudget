import React, { useCallback } from 'react';
import { Props as P } from './Types';
import { Category } from '../../../moneymoney';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_UPDATE_INCOME_CATEGORY } from '../../../budget';
import { Select } from '../../../components';
import styles from './Categories.module.scss';

type Props = {
  dispatch: P['dispatch'];
  categoryId: string | null;
  incomeCategoryIds: (string | null)[];
  categories: Category[];
};

function validate({ target: { value } }: { target: { value: string } }) {
  return value;
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
      (value: string | null) => {
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
    <Select
      {...inputProps}
      value={inputProps.value === null ? '__NEW__' : inputProps.value}
      className={styles.incomeCategorySelect}
    >
      {!categoryId && (
        <option value="__NEW__" disabled>
          [please select]
        </option>
      )}
      {categories.map(({ uuid, name, group, indentation }) => {
        if (categoryId !== uuid && incomeCategoryIds.includes(uuid)) {
          return null;
        }
        if (categoryId === uuid) {
          found = true;
        }
        return (
          <option key={uuid} value={uuid} disabled={group}>
            {Array(indentation).fill('–').join('')} {name}
          </option>
        );
      })}
      {!found && categoryId && (
        <option value={categoryId}>- currently unused -</option>
      )}
    </Select>
  );
}
