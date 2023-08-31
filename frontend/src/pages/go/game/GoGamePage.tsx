import { Flex, Spinner, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import { useGoGameGameUpdatedEvent, useGoGameGetGameState } from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import { parseBigint } from '../../../utils/textUtils';
import InteractiveGoBoard from './../components/board/InteractiveGoBoard';
import GameStatusBox from './GameStatusBox';

function ErrorMessage({ children }: PropsWithChildren) {
  return <Text fontSize="lg">{children}</Text>;
}

export default function GoGamePage() {
  const { gameId: gameIdAsString } = useParams();

  const gameId = parseBigint(gameIdAsString);

  return gameId === null ? (
    <ErrorMessage>Invalid game id!</ErrorMessage>
  ) : (
    <PageWithGameId gameId={gameId} />
  );
}

function PageWithGameId({ gameId }: { gameId: bigint }) {
  const { chainId } = useAppContext();

  const {
    data: gameState,
    status: gameStateStatus,
    refetch: refetchGameState,
  } = useGoGameGetGameState({
    args: [gameId],
    chainId: chainId,
  });

  useGoGameGameUpdatedEvent({
    listener: (logs) => {
      if (logs.some((log) => log.args.gameId === gameId)) {
        refetchGameState();
      }
    },
  });

  if (
    gameId === null ||
    gameStateStatus == 'error' ||
    (gameStateStatus == 'success' && gameState?.info.gameId !== gameId)
  ) {
    return <ErrorMessage>Game not found!</ErrorMessage>;
  }

  if (gameStateStatus === 'loading') {
    return <Spinner color="red.500" />;
  }
  if (gameStateStatus !== 'success' || !gameState) {
    return <ErrorMessage>Error! Something went wrong.</ErrorMessage>;
  }

  return (
    <Flex w="full" gap={2}>
      <InteractiveGoBoard flex={1} gameState={gameState} />
      <GameStatusBox gameState={gameState} />
    </Flex>
  );
}
