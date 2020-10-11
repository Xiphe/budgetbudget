import { Dispatch, useMemo } from 'react';
import {
  ACTION_SET_CATEGORY_VALUE,
  ACTION_SET_CATEGORY_ROLLOVER,
  Action,
} from '../../budget';

export type ActionCreators = {
  setBudgeted: (args: { amount: number; id: string }) => void;
  toggleRollover: (args: { id: string; rollover: boolean }) => void;
};

export default function useSetBudgeted({
  monthKey,
  dispatch,
}: {
  monthKey: string;
  dispatch?: Dispatch<Action>;
}) {
  return useMemo<ActionCreators | undefined>(
    () =>
      !dispatch
        ? undefined
        : {
            setBudgeted({ amount, id }) {
              dispatch({
                type: ACTION_SET_CATEGORY_VALUE,
                payload: {
                  amount,
                  monthKey,
                  categoryId: id,
                },
              });
            },
            toggleRollover({ id, rollover }) {
              dispatch({
                type: ACTION_SET_CATEGORY_ROLLOVER,
                payload: {
                  rollover,
                  monthKey,
                  categoryId: id,
                },
              });
            },
          },
    [monthKey, dispatch],
  );
}
