import React, { useState } from 'react';
import { BudgetState } from './Types';

type Props = {
  onCreate: (budget: BudgetState) => void;
};

export default function NewBudget({ onCreate }: Props) {
  const [name, setName] = useState('');
  return (
    <>
      <h1>Creating a new Budget</h1>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder="My new Budget"
        />
      </label>
      <button
        disabled={name === ''}
        onClick={() => onCreate({ name, settings: {} })}
      >
        Create
      </button>
    </>
  );
}
