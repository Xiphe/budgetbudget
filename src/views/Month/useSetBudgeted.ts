import { useCallback } from 'react';
import { ACTION_SET_CATEGORY_VALUE } from '../../budget';
import { Props } from './Types';

export default function useSetBudgeted({
  monthKey,
  dispatch,
  currency,
}: Pick<Props, 'monthKey' | 'dispatch' | 'currency'>) {
  return useCallback<(ev: { amount: number; id: number }) => void>(
    ({ amount, id }) => {
      dispatch({
        type: ACTION_SET_CATEGORY_VALUE,
        payload: {
          currency,
          amount,
          monthKey,
          categoryId: id,
        },
      });
    },
    [monthKey, dispatch, currency],
  );
}
