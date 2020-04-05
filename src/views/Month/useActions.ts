import { useMemo } from 'react';
import { ACTION_SET_CATEGORY_VALUE } from '../../budget';
import { Props } from './Types';

export default function useSetBudgeted({
  monthKey,
  dispatch,
  currency,
}: Pick<Props, 'monthKey' | 'dispatch' | 'currency'>) {
  return useMemo(
    () => ({
      setBudgeted({ amount, id }: { amount: number; id: number }) {
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
    }),
    [monthKey, dispatch, currency],
  );
}
export type ActionCreators = ReturnType<typeof useSetBudgeted>;
