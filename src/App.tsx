import React, { Suspense } from 'react';
import { useInit } from './lib';
import { Loading } from './components';
import Budget from './budget';

export default function App() {
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
