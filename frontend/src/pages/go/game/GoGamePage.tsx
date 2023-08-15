import { HStack, Text, VStack, useToast } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useGoGameGetGameState, useGoGameStonePlayedEvent } from '../../../generated/blockchain';

export default function GoGamePage() {
  const { gameId: gameIdString } = useParams();
  const toast = useToast({ status: 'error', isClosable: true });

  const gameId = BigInt('0x' + gameIdString || 0);

  const {
    data: gameState,
    status: gameStateStatus,
    refetch: refetchGameState,
  } = useGoGameGetGameState({
    args: [gameId],
  });

  useGoGameStonePlayedEvent({
    listener: (logs) => {
      if (logs.some((log) => log.args.gameId === gameId)) {
        refetchGameState();
      }
    },
  });

  console.log(gameId, gameStateStatus, gameState);

  if (
    !gameId ||
    gameStateStatus == 'error' ||
    (gameStateStatus == 'success' && gameState?.info.gameId !== gameId)
  ) {
    return (
      <VStack>
        <VStack align="stretch">
          <h1>Game not found!</h1>
        </VStack>
      </VStack>
    );
  }

  if (gameStateStatus !== 'success') {
    return (
      <VStack>
        <VStack align="stretch">
          <HStack>
            <h1>Loading!</h1>
          </HStack>
        </VStack>
      </VStack>
    );
  }
  if (!gameState) {
    toast({ title: 'Something went wrong!' });
    return;
  }

  return (
    <VStack>
      <VStack align="stretch">
        <HStack>
          <div>
            Phase: {gameState.phase}
            <br />
            Result: {gameState.result.result}
          </div>
        </HStack>
        <div>
          {gameState.board.map((r, ri) => (
            <Text fontFamily="mono" key={ri}>
              {r.map((v, vi) => (
                <span key={vi}>{['· ', '⚫', '⚪'][v]}</span>
              ))}
            </Text>
          ))}
        </div>
      </VStack>
    </VStack>
  );
}
