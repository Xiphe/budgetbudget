import './theme.scss';
import React, { Suspense } from 'react';
import { useInit } from './lib';
import { Loading } from './components';
import Budget from './views/Budget';
import styles from './App.module.scss';

export default function App() {
  const init = useInit();
  return (
    <div className={styles.app}>
      <Suspense fallback={<Loading />}>
        {!init ? (
          <Loading />
        ) : init instanceof Error ? (
          <p>Error: {init.message}</p>
        ) : (
          <Budget init={init} />
        )}
      </Suspense>
    </div>
  );
}
