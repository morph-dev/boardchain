import { Button, HStack, TableCellProps, TableRowProps, Td, Text, Tr } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { prepareWriteContract, writeContract } from 'wagmi/actions';
import AddressWithCopy from '../../../../components/AddressWithCopy';
import { ticTacToeLobbyABI, ticTacToeLobbyAddress } from '../../../../generated/blockchain';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { useAppContext } from '../../../../providers/AppContext';
import { ChallengeGame } from '../../types';
import { OSymbol, XSymbol } from '../Symbols';

export interface PlayerCellProps extends TableCellProps {
  address: Address;
  isX: boolean;
}

function PlayerCell({ address, isX, ...props }: PlayerCellProps) {
  return (
    <Td {...props}>
      <HStack gap={0}>
        <AddressWithCopy address={address} copyIconSize="sm" showMe />
        <Text>- plays</Text>
        {isX ? <XSymbol /> : <OSymbol />}
      </HStack>
    </Td>
  );
}

export interface ChallengeRowProps extends TableRowProps {
  challenge: ChallengeGame;
  showMaker: boolean;
  showTaker: boolean;
}

export default function ChallengeRow({ challenge, showMaker, showTaker }: ChallengeRowProps) {
  const { chainId, userAddress } = useAppContext();
  const errorHandler = useErrorHandler();

  const [pending, setPending] = useState(false);

  const onAccept = useCallback(() => {
    setPending(true);
    prepareWriteContract({
      abi: ticTacToeLobbyABI,
      address: ticTacToeLobbyAddress[chainId],
      chainId: chainId,
      functionName:
        challenge.taker === zeroAddress ? 'acceptOpenChallenge' : 'acceptDirectChallenge',
      args: [challenge.gameId],
    })
      .then(writeContract)
      .catch(errorHandler('Error accepting the challenge!'))
      .finally(() => setPending(false));
  }, [chainId, challenge.gameId, challenge.taker, errorHandler]);

  const onCancel = useCallback(() => {
    setPending(true);
    prepareWriteContract({
      abi: ticTacToeLobbyABI,
      address: ticTacToeLobbyAddress[chainId],
      chainId: chainId,
      functionName:
        challenge.taker === zeroAddress ? 'cancelOpenChallenge' : 'cancelDirectChallenge',
      args: [challenge.gameId],
    })
      .then(writeContract)
      .catch(errorHandler('Error canceling the challenge!'))
      .finally(() => setPending(false));
  }, [chainId, challenge.gameId, challenge.taker, errorHandler]);

  const canAccept =
    challenge.maker !== userAddress &&
    (challenge.taker === userAddress || challenge.taker === zeroAddress);

  const canCancel = challenge.maker === userAddress || challenge.taker === userAddress;

  return (
    <Tr>
      {showMaker && <PlayerCell address={challenge.maker} isX={challenge.makerIsX} />}
      {showTaker && <PlayerCell address={challenge.taker} isX={!challenge.makerIsX} />}
      <Td>
        <HStack justify="center">
          {canAccept && (
            <Button isLoading={pending} onClick={onAccept} colorScheme="green">
              Accept
            </Button>
          )}
          {canCancel && (
            <Button isLoading={pending} onClick={onCancel} colorScheme="red">
              Cancel
            </Button>
          )}
        </HStack>
      </Td>
    </Tr>
  );
}
