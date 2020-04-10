import React, { Dispatch, useCallback, ChangeEvent, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  BudgetState,
  Action,
  ACTION_SETTINGS_SET_SELECTED_ACCOUNTS,
} from '../../budget';
import { Content } from '../../components';
import { appName, useInputProps, createNumberFormatter } from '../../lib';
import {
  ACTION_SET_NAME,
  ACTION_SETTINGS_SET_NUMBER_LOCALE,
  ACTION_SETTINGS_SET_FRACTION_DIGITS,
} from '../../budget';
import Input from './Input';
import Setting from './Setting';
import AccountSelect from './AccountSelect';
import styles from './Settings.module.scss';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Settings({ state, dispatch }: Props) {
  const {
    name,
    settings: { numberLocale, fractionDigits, accounts },
  } = state;
  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const nameInputProps = useInputProps({
    value: name || '',
    onChange: useCallback(
      (payload: string) => {
        dispatch({ type: ACTION_SET_NAME, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      if (ev.target.value === '') {
        throw new Error('Please provide a name for the Budget');
      }
      return ev.target.value;
    }, []),
  });
  const numberLocaleProps = useInputProps({
    value: numberLocale,
    onChange: useCallback(
      (payload: string) => {
        dispatch({ type: ACTION_SETTINGS_SET_NUMBER_LOCALE, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      if (ev.target.value === '') {
        throw new Error('Please enter a Language Tag');
      }
      try {
        new (Intl as any).Locale(ev.target.value);
      } catch (err) {
        throw new Error('Language Tag format seems to be invalid');
      }
      return ev.target.value;
    }, []),
  });
  const fractionDigitsProps = useInputProps({
    value: fractionDigits,
    onChange: useCallback(
      (payload: number) => {
        dispatch({ type: ACTION_SETTINGS_SET_FRACTION_DIGITS, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(ev.target.value, 10);
      if (value.toString() !== ev.target.value) {
        throw new Error('Please enter a valid number');
      }

      return value;
    }, []),
  });
  const accountSelectProps = useInputProps({
    value: accounts,
    onChange: useCallback(
      (payload: string[]) => {
        dispatch({ type: ACTION_SETTINGS_SET_SELECTED_ACCOUNTS, payload });
      },
      [dispatch],
    ),
    validate: useCallback(
      ({ target: { value } }: { target: { value: string[] } }) => {
        if (value.length === 0) {
          throw new Error('Please select at least one account');
        }

        return value;
      },
      [],
    ),
  });

  return (
    <Content padding={true}>
      <Helmet>
        <title>Settings - {appName}</title>
      </Helmet>
      <h1 className={styles.headline}>Settings</h1>
      <Setting label="Name">
        <Input
          {...nameInputProps}
          type="text"
          placeholder="Private, Band, ..."
        />
      </Setting>
      <hr />
      <Setting label="Accounts">
        <AccountSelect {...accountSelectProps} />
      </Setting>
      <hr />
      <Setting label="Number format Example">
        {numberFormatter.format(12345.6789)}
      </Setting>
      <Setting label="Number format Locale">
        <Input
          {...numberLocaleProps}
          type="text"
          placeholder="en, de-AT, ..."
        />
      </Setting>
      <Setting label="Fraction Digits">
        <Input {...fractionDigitsProps} type="number" placeholder="2, 3, ..." />
      </Setting>
    </Content>
  );
}
