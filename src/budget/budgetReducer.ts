import { BudgetState } from './Types';

export const ACTION_INIT = Symbol('INIT');

type InitAction = {
  type: typeof ACTION_INIT;
  payload: BudgetState;
};
type Action = InitAction;

export default function budgetReducer(
  state: null | BudgetState,
  { type, payload }: Action,
): null | BudgetState {
  switch (type) {
    case ACTION_INIT:
      return payload;
    default:
      throw new Error(`Unexpected Action type ${type.toString()}`);
  }
}
