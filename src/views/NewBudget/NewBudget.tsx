import React, {
  Dispatch,
  unstable_useTransition,
  useCallback,
  useState,
} from 'react';
import { Action, BudgetState } from '../../budget';
import { Content, Button, Header, HeaderSpacer } from '../../components';
import useMenu from '../../lib/useMenu';
import { OK, Step } from './Types';
import Welcome from './01_welcome';
import Categories from './02_categories';
import { MoneyMoneyRes } from '../../moneymoney';

const STEPS: Step[] = [Welcome, Categories];

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
  moneyMoney: MoneyMoneyRes;
  onCreate: () => void;
};

const INITIAL_STEP = 0;

function getProgress(i: number) {
  return (100 / (STEPS.length - 1)) * i;
}

export default function NewBudget({ state, dispatch, moneyMoney }: Props) {
  const [
    {
      step: { Comp },
      ok,
      nextTitle,
      progress,
    },
    setStep,
  ] = useState<{
    step: Step;
    nextTitle: string | undefined;
    progress: number;
    ok: OK;
  }>(() => ({
    step: STEPS[INITIAL_STEP],
    progress: getProgress(INITIAL_STEP),
    nextTitle: STEPS[INITIAL_STEP + 1]?.title,
    ok: STEPS[INITIAL_STEP].initialOk(state),
  }));
  useMenu(moneyMoney.refresh);

  const [startTransition] = unstable_useTransition({
    timeoutMs: 5000,
  });
  const nextPage = useCallback(() => {
    startTransition(() => {
      setStep(({ step }) => {
        const nextIndex = STEPS.indexOf(step) + 1;
        const nextStep = STEPS[nextIndex];
        const nextTitle = STEPS[STEPS.indexOf(nextStep) + 1]?.title;

        return {
          step: nextStep,
          nextTitle,
          progress: getProgress(nextIndex),
          ok: nextStep.initialOk(state),
        };
      });
    });
  }, [startTransition, state]);
  const setOk = useCallback((ok: OK) => {
    setStep((step) => ({ ...step, ok }));
  }, []);

  if (state === null) {
    throw new Error('Unexpected non-initialized state');
  }

  return (
    <Content
      flex
      header={
        <Header>
          <span>Create a new Budget ({progress}%)</span>
          <HeaderSpacer />
          <Button>Jump to Settings</Button>
          {nextTitle ? (
            <Button
              primary={ok === 'primary'}
              disabled={ok === false}
              onClick={nextPage}
            >
              {nextTitle}
            </Button>
          ) : null}
        </Header>
      }
    >
      <Comp
        setOk={setOk}
        state={state}
        dispatch={dispatch}
        moneyMoney={moneyMoney}
        nextPage={nextPage}
      />
    </Content>
  );
}
