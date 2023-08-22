import { Button, HStack, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import AddressWithCopy from '../AddressWithCopy';
import Chain from './Chain';

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
      {address && <AddressWithCopy address={address} />}
      <Chain />
      <Button onClick={() => disconnectAsync().catch(errorHandler('Disconnecting failed!'))}>
        Disconnect
      </Button>
    </HStack>
  );
}
