import { Button, HStack, Text, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { elliptAddress } from '../../utils/textUtils';
import Chain from './Chain';
import { useErrorHandler } from '../../hooks/useErrorHandler';

export default function Account() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isLoading: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const errorHandler = useErrorHandler();
  const toast = useToast();

  const onConnectClick = useCallback(() => {
    const connector = connectors.find((conn) => conn.ready);
    if (!connector) {
      toast({
        title: 'Cannot connect',
        description: 'Wallet connector not found',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    connectAsync({ connector }).catch(errorHandler('Connecting failed!'));
  }, [connectAsync, connectors, errorHandler, toast]);

  if (!isConnected) {
    return (
      <Button isLoading={isConnecting} onClick={onConnectClick}>
        Connect
      </Button>
    );
  }

  return (
    <HStack>
      {address ? <Text fontFamily="mono">{elliptAddress(address)}</Text> : null}
      <Chain />
      <Button onClick={() => disconnectAsync().catch(errorHandler('Disconnecting failed!'))}>
        Disconnect
      </Button>
    </HStack>
  );
}
