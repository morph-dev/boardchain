import {
  Button,
  HStack,
  Table,
  TableCaption,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { prepareWriteContract, writeContract } from 'wagmi/actions';
import { ticTacToeLobbyABI, ticTacToeLobbyAddress } from '../../../../generated/blockchain';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { useAppContext } from '../../../../providers/AppContext';
import { elliptAddress } from '../../../../utils/textUtils';
import { ChallengeGame } from '../../types';

type ChallengeRowProps = {
  challenge: ChallengeGame;
  showMaker: boolean;
  showTaker: boolean;
};

function ChallengeRow({ challenge, showMaker, showTaker }: ChallengeRowProps) {
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

  const formatPlayer = (address: Address, isX: boolean): string => {
    const playOrder = `(plays ${isX ? 'first' : 'second'})`;
    if (address === zeroAddress) {
      return `? ${playOrder}`;
    } else if (address === userAddress) {
      return `me ${playOrder}`;
    } else {
      return `${elliptAddress(address)} ${playOrder}`;
    }
  };

  const canAccept =
    challenge.maker !== userAddress &&
    (challenge.taker === userAddress || challenge.taker === zeroAddress);

  const canCancel = challenge.maker === userAddress || challenge.taker === userAddress;

  return (
    <Tr>
      {showMaker && (
        <Td>
          <Text fontFamily="mono">{formatPlayer(challenge.maker, challenge.makerIsX)}</Text>
        </Td>
      )}
      {showTaker && (
        <Td>
          <Text fontFamily="mono">{formatPlayer(challenge.taker, !challenge.makerIsX)}</Text>
        </Td>
      )}
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

export interface ChallengesTableProps extends TableContainerProps {
  challenges: readonly ChallengeGame[];
  title?: string;
  showMaker?: boolean;
  showTaker?: boolean;
}

export default function ChallengesTable({
  challenges,
  title,
  showMaker = true,
  showTaker = true,
  ...props
}: ChallengesTableProps) {
  return (
    <TableContainer {...props}>
      <Table>
        {title && (
          <TableCaption placement="top" fontSize="lg" m={0} p={0}>
            {title}
          </TableCaption>
        )}
        <Thead>
          <Tr>
            {showMaker && (
              <Th textAlign="center" minW={80}>
                challenger
              </Th>
            )}
            {showTaker && (
              <Th textAlign="center" minW={80}>
                challenged
              </Th>
            )}
            <Th textAlign="center" minW={60}>
              Available Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {challenges.map((challenge) => (
            <ChallengeRow
              key={challenge.gameId.toString()}
              challenge={challenge}
              showMaker={showMaker}
              showTaker={showTaker}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
