import { useMemo } from 'react';
import {
  ACTION_SET_CATEGORY_VALUE,
  ACTION_SET_CATEGORY_ROLLOVER,
} from '../../budget';
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
      toggleRollover({ id, rollover }: { id: number; rollover: boolean }) {
        dispatch({
          type: ACTION_SET_CATEGORY_ROLLOVER,
          payload: {
            rollover,
            currency,
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
