import React, { useEffect, MutableRefObject } from 'react';
import { Category } from '../../../moneymoney';
import { StepCompProps } from '../Types';
import CategorySidebar from '../../CategorySidebar';
import { useFilteredCategories } from '../../../budget';

type Props = StepCompProps & {
  ignoreLoadingError?: boolean;
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  syncScrollY?: MutableRefObject<HTMLDivElement | null>;
};

export default function CatSidebar({
  moneyMoney,
  dispatch,
  setOk,
  innerRef,
  syncScrollY,
  ignoreLoadingError,
  state: {
    settings: { collapsedCategories, incomeCategories },
  },
}: Props) {
  const [categories] = (() => {
    try {
      return moneyMoney.categories.read();
    } catch (err) {
      if (!ignoreLoadingError || !(err instanceof Error)) {
        throw err;
      }
      return [[] as Category[]];
    }
  })();
  const filteredCats = useFilteredCategories(incomeCategories, categories);
  const hasCats = filteredCats.length;

  useEffect(() => {
    setOk(hasCats > 0);
  }, [setOk, hasCats]);

  return (
    <CategorySidebar
      innerRef={innerRef}
      syncScrollY={syncScrollY}
      dispatch={dispatch}
      categories={filteredCats}
      collapsedCategories={collapsedCategories}
    />
  );
}
