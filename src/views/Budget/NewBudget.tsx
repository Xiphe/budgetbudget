import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { BudgetState, VERSION } from '../../budget';
import { useAccounts } from '../../moneymoney';
import { Loading } from '../../components';
import { appName } from '../../lib';

type Props = {
  onCreate: (budget: BudgetState) => void;
};

type AccountSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
};
function AccountSelect({ value, onChange }: AccountSelectProps) {
  const [accounts, retry] = useAccounts('EUR');

  if (!accounts) {
    return <Loading />;
  }

  if (accounts instanceof Error) {
    return (
      <div>
        <p>Error: {accounts.message}</p>
        <button onClick={retry}>retry</button>
      </div>
    );
  }

  return (
    <ul>
      {accounts.map(({ number, name }) => (
        <li key={number}>
          <label>
            <input
              type="checkbox"
              checked={value.includes(number)}
              onChange={() => {
                const i = value.indexOf(number);
                if (i === -1) {
                  onChange(value.concat(number));
                } else {
                  onChange(value.filter((n) => n !== number));
                }
              }}
            />
            {name}
          </label>
        </li>
      ))}
    </ul>
  );
}

export default function NewBudget({ onCreate }: Props) {
  const [name, setName] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  return (
    <>
      <Helmet>
        <title>New Budget - {appName}</title>
      </Helmet>
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
      <AccountSelect value={selectedAccounts} onChange={setSelectedAccounts} />
      <button
        disabled={name === '' || !selectedAccounts.length}
        onClick={() =>
          onCreate({
            name,
            version: VERSION,
            settings: {
              startDate: 0,
              startBalance: 0,
              currency: 'EUR',
              numberLocale: 'de-DE',
              accounts: selectedAccounts,
              incomeCategories: [],
              fractionDigits: 2,
            },
            budgets: {},
          })
        }
      >
        Create
      </button>
    </>
  );
}
