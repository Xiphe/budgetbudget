import React, { Dispatch, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { BudgetState, Action } from '../../budget';
import { Content } from '../../components';
import { appName, createNumberFormatter, useSetShowSettings } from '../../lib';
import Setting from './Setting';
import styles from './Settings.module.scss';
import {
  NameSetting,
  AccountSetting,
  NumberLocaleSetting,
  FractionDigitsSetting,
  StartDateSetting,
  StartBalanceSetting,
  CurrencySetting,
} from './SettingTypes';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Settings(props: Props) {
  const showSettings = useSetShowSettings();
  const { numberLocale, fractionDigits, accounts } = props.state.settings;
  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const valid = accounts.length > 0;

  return (
    <Content padding={true}>
      <Helmet>
        <title>Settings - {appName}</title>
      </Helmet>
      <h1 className={styles.headline}>Settings</h1>
      <button
        title="close"
        disabled={!valid}
        className={styles.close}
        onClick={() => showSettings(false)}
      >
        ✕
      </button>
      <NameSetting {...props} />
      <CurrencySetting {...props} />
      <hr />
      <Setting label="Accounts">
        <AccountSetting {...props} />
      </Setting>
      <hr />
      <Setting label="Number format Example">
        {numberFormatter.format(12345.6789)}
      </Setting>
      <NumberLocaleSetting {...props} />
      <FractionDigitsSetting {...props} />
      <hr />
      <StartDateSetting {...props} />
      <StartBalanceSetting {...props} numberFormatter={numberFormatter} />
    </Content>
  );
}
