import { Spinner, Text, VStack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import { useTicTacToeGame } from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import { bigintToString } from '../../../utils/textUtils';
import { GamePhase } from '../types';

function parseGameId(gameIdString: string | undefined): bigint | null {
  try {
    return gameIdString ? BigInt(gameIdString) : null;
  } catch (_) {
    return null;
  }
}

function ErrorMessage({ children }: PropsWithChildren) {
  return <Text fontSize="xl">{children}</Text>;
}

export default function TicTacToeGamePage() {
  const { gameId: gameIdString } = useParams();

  const gameId = parseGameId(gameIdString);

  return gameId === null ? (
    <ErrorMessage>Invalid game id!</ErrorMessage>
  ) : (
    <PageWithGameId gameId={gameId} />
  );
}

function PageWithGameId({ gameId }: { gameId: bigint }) {
  const { chainId } = useAppContext();

  const { data: game, status: gameStatus } = useTicTacToeGame({
    chainId: chainId,
    args: [gameId],
  });

  if (gameStatus === 'loading') {
    return <Spinner />;
  }

  if (!game) {
    return (
      <VStack>
        <ErrorMessage>Something went wrong!</ErrorMessage>
        <Text>Try refreshing the page</Text>
      </VStack>
    );
  }

  if (game.phase === GamePhase.NotCreated) {
    return <ErrorMessage>Game not found!</ErrorMessage>;
  }

  return (
    <>
      <ErrorMessage>Not implemented</ErrorMessage>
      <Text>{bigintToString(gameId)}</Text>
    </>
  );
}
