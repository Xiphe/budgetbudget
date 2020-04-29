import React from 'react';
import classNames from 'classnames';
import { useCategories } from '../../../moneymoney';
import { Loading, LoadingError } from '../../../components';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import IncomeCategories from './IncomeCategories';

export default function CategorySettings(props: Omit<Props, 'categories'>) {
  const { currency } = props.state.settings;
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [categories, _, retry] = useCategories(currency);

  if (categories === null) {
    return <Loading center />;
  }

  if (categories instanceof Error) {
    return (
      <LoadingError
        className={classNames(styles.loadingError, styles.categoryLoadingError)}
        retry={retry}
        message={categories.message}
      />
    );
  }

  return <IncomeCategories {...props} categories={categories} />;
}
