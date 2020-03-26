import './theme.scss';
import React, { Suspense } from 'react';
import { useInit } from './lib';
import { Loading } from './components';
import Budget from './budget';
import styles from './App.module.scss';

function Init() {
  const init = useInit();
  if (!init) {
    return <Loading />;
  }

  if (init instanceof Error) {
    return <p>Error: {init.message}</p>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Budget init={init} />
    </Suspense>
  );
}
export default function App() {
  return (
    <div className={styles.app}>
      <Init />
    </div>
  );
}
