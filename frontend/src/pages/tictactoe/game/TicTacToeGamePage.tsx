import { Flex, Spacer, Spinner, Text, VStack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import AddressWithCopy from '../../../components/AddressWithCopy';
import { useTicTacToeGame, useTicTacToeGameUpdatedEvent } from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import GameStatus from '../components/GameStatus';
import { OSymbol, XSymbol } from '../components/Symbols';
import InteractiveBoard from '../components/board/InteractiveBoard';
import { GamePhase } from '../types';

function parseGameId(gameIdString: string | undefined): bigint | null {
  try {
    return gameIdString ? BigInt(gameIdString) : null;
  } catch (_) {
    return null;
  }
}

function ErrorMessage({ children }: PropsWithChildren) {
  return <Text fontSize="lg">{children}</Text>;
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

  const {
    data: game,
    status: gameStatus,
    refetch: gameRefetch,
  } = useTicTacToeGame({
    chainId: chainId,
    args: [gameId],
  });

  useTicTacToeGameUpdatedEvent({
    chainId: chainId,
    listener: (logs) => {
      if (logs.some((log) => log.args.gameId === gameId)) {
        gameRefetch();
      }
    },
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
    <VStack w="full" h="full">
      <Flex w="full" maxW="500px" minW="100px">
        <XSymbol />
        <AddressWithCopy address={game.playerX} copyIconSize="sm" showMe />
        <Spacer />
        <OSymbol />
        <AddressWithCopy address={game.playerO} copyIconSize="sm" showMe />
      </Flex>

      <InteractiveBoard game={game} />

      <GameStatus game={game} fontSize="4xl" />
    </VStack>
  );
}
