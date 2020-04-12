import React, { Dispatch, useMemo } from 'react';
import { BudgetState, Action } from '../../../budget';
import { createNumberFormatter } from '../../../lib';
import Setting from '../Setting';
import NameSetting from './Name';
import AccountSetting from './Account';
import NumberLocaleSetting from './NumberLocale';
import FractionDigitsSetting from './FractionDigits';
import StartDateSetting from './StartDate';
import StartBalanceSetting from './StartBalance';
import CurrencySetting from './Currency';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Settings(props: Props) {
  const { numberLocale, fractionDigits } = props.state.settings;
  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );

  return (
    <>
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
    </>
  );
}
