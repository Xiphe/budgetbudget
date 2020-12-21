import React, { Suspense } from 'react';
import Setting from '../Setting';
import NameSetting from './Name';
import AccountSetting from './Account';
import FractionDigitsSetting from './FractionDigits';
import StartDateSetting from './StartDate';
// import StartBalanceSetting from './__StartBalance';
import CurrencySetting from './Currency';
import { Props } from './Types';
import { Loading } from '../../../components';
import { NumberFormatter } from '../../../lib/createNumberFormatter';

export default function Settings(
  props: Props & { numberFormatter: NumberFormatter },
) {
  return (
    <>
      <Setting label="Name" id="setting-name">
        <NameSetting {...props} id="setting-name" />
      </Setting>
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
      <Setting label="Start Date" id="setting-start-date">
        <StartDateSetting {...props} id="setting-start-date" />
      </Setting>
      {/* <StartBalanceSetting {...props} /> */}
    </>
  );
}
