import { useContext } from 'react';
import ClientContext from './ClientContext';
import { ApiClient } from './createApiClient';

export default function useClient(): ApiClient {
  const client = useContext(ClientContext);

  if (!client) {
    throw new Error(
      'MoneyMoney API Client not found, make sure a provider is mounted',
    );
  }

  return client;
}
