import { useMemo } from 'react';
import {
  ACTION_SET_CATEGORY_VALUE,
  ACTION_SET_CATEGORY_ROLLOVER,
} from '../../budget';
import { Props } from './Types';

export default function useSetBudgeted({
  monthKey,
  dispatch,
}: Pick<Props, 'monthKey' | 'dispatch'>) {
  return useMemo(
    () => ({
      setBudgeted({ amount, id }: { amount: number; id: string }) {
        dispatch({
          type: ACTION_SET_CATEGORY_VALUE,
          payload: {
            amount,
            monthKey,
            categoryId: id,
          },
        });
      },
      toggleRollover({ id, rollover }: { id: string; rollover: boolean }) {
        dispatch({
          type: ACTION_SET_CATEGORY_ROLLOVER,
          payload: {
            rollover,
            monthKey,
            categoryId: id,
          },
        });
      },
    }),
    [monthKey, dispatch],
  );
}
export type ActionCreators = ReturnType<typeof useSetBudgeted>;
