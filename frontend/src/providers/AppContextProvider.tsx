import { Button, Heading, VStack } from '@chakra-ui/react';
import { PropsWithChildren, useCallback } from 'react';
import { isAddress } from 'viem';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { getDefaultChain, isSupportedChainId } from '../utils/chains';
import { AppContext, AppContextContext } from './AppContext';

function ChainNotSupported() {
  const { isLoading, switchNetworkAsync } = useSwitchNetwork();
  const defaultChain = getDefaultChain();

  const switchChain = useCallback(
    () => switchNetworkAsync && switchNetworkAsync(defaultChain.id),
    [switchNetworkAsync, defaultChain.id]
  );
  return (
    <VStack>
      <Heading as="h1">Chain is not supported!</Heading>
      <Button isLoading={isLoading} onClick={switchChain}>
        Change to {defaultChain.name}
      </Button>
    </VStack>
  );
}

export default function AppContextProvider({ children }: PropsWithChildren) {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const defaultChain = getDefaultChain();
  let chainId = defaultChain.id;

  if (isConnected) {
    if (!chain || chain.unsupported || !isSupportedChainId(chain.id)) {
      return <ChainNotSupported />;
    }
    chainId = chain.id;
  }

  const state: AppContext = {
    chainId: chainId,
    userAddress: isConnected && address && isAddress(address) ? address : null,
  };

  return <AppContextContext.Provider value={state}>{children}</AppContextContext.Provider>;
}
