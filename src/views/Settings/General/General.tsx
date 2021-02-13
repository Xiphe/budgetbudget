import React, { Suspense } from 'react';
import Setting from '../Setting';
import NameSetting from './Name';
import AccountSetting from './Account';
import FractionDigitsSetting from './FractionDigits';
import StartDateSetting from './StartDate';
import StartBalanceSetting from './StartBalance';
import CurrencySetting from './Currency';
import { Props } from './Types';
import { Loading } from '../../../components';
import { NumberFormatter } from '../../../lib/createNumberFormatter';
import IgnorePendingTransactionsSetting from './IgnorePendingTransactions';

export default function Settings(
  props: Props & { numberFormatter: NumberFormatter },
) {
  return (
    <>
      <NameSetting {...props} />
      <CurrencySetting {...props} />
      <hr />
      <Setting label="Accounts">
        <Suspense fallback={<Loading />}>
          <AccountSetting {...props} />
        </Suspense>
      </Setting>
      <hr />
      <FractionDigitsSetting {...props} />
      <hr />
      <IgnorePendingTransactionsSetting {...props} />
      <hr />
      <StartDateSetting {...props} />
      <StartBalanceSetting {...props} />
    </>
  );
}
