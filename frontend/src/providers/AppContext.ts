import { createContext } from 'react';

import { Address } from 'wagmi';
import { SupportedChainId } from '../utils/chains';
import { createContextHook } from '../utils/contextUtils';

export interface AppContext {
  chainId: SupportedChainId;
  userAddress: Address | null;
}

export const AppContextContext = createContext<AppContext | null>(null);

export const useAppContext = createContextHook(AppContextContext);
