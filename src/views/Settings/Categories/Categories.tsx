import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTransactions, getFlatCategories } from '../../../moneymoney';
import { Loading, LoadingError } from '../../../components';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import IncomeCategories from './IncomeCategories';

export default function CategorySettings(props: Omit<Props, 'categories'>) {
  const { startDate, currency, accounts } = props.state.settings;
  const [transactions, retry] = useTransactions(startDate, currency, accounts);
  const categories = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return [];
    }
    return getFlatCategories(transactions);
  }, [transactions]);

  if (transactions === null) {
    return <Loading />;
  }

  if (transactions instanceof Error) {
    return (
      <LoadingError
        className={classNames(styles.loadingError, styles.categoryLoadingError)}
        retry={retry}
        message={transactions.message}
      />
    );
  }

  return (
    <>
      <IncomeCategories {...props} categories={categories} />
    </>
  );
}
