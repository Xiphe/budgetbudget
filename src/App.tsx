import React from 'react';
import { useInit } from './lib';
import { Loading } from './components';

export default function App() {
  const init = useInit();

  if (!init) {
    return <Loading />;
  }

  if (init instanceof Error) {
    return <p>Error: {init.message}</p>;
  }

  return <h1>Hello {init}</h1>;
}
