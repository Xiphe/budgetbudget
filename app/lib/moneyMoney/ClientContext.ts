import { createContext } from 'react';
import { ApiClient } from './createApiClient';

export default createContext<ApiClient | null>(null);
