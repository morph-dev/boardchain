import { Flex, Spinner, Text } from '@chakra-ui/react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  goGameABI,
  goGameAddress,
  useGoGameGameUpdatedEvent,
  useGoGameGetGameState,
} from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import { parseBigint } from '../../../utils/textUtils';
import InteractiveGoBoard from './../components/board/InteractiveGoBoard';
import GameStatusBox from './GameStatusBox';
import { GameFullStateType, GamePhase } from '../types';
import { readContract } from 'wagmi/actions';

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
    refetch: gameStateRefetch,
  } = useGoGameGetGameState({ chainId: chainId, args: [gameId] });

  useGoGameGameUpdatedEvent({
    listener: (logs) => {
      if (logs.some((log) => log.args.gameId === gameId)) {
        gameStateRefetch();
      }
    },
  });

  const [scorePreview, setScorePreview] = useState<GameFullStateType['scoringState'] | null>(null);

  useEffect(() => {
    setScorePreview(null);
    console.log('Updating preview');
    if (!gameState || gameState.phase !== GamePhase.Scoring) {
      return;
    }

    readContract({
      abi: goGameABI,
      address: goGameAddress[chainId],
      chainId: chainId,
      functionName: 'previewScoringState',
      args: [gameState.info.gameId],
    }).then(setScorePreview);
  }, [chainId, gameState]);

  const renderGameState = useMemo<GameFullStateType | undefined>(() => {
    if (!gameState || !scorePreview) {
      return gameState;
    }
    return {
      ...gameState,
      scoringState: scorePreview,
    };
  }, [gameState, scorePreview]);

  if (gameStateStatus === 'loading') {
    return <Spinner color="blue.500" />;
  }

  if (gameStateStatus == 'success' && gameState?.info.gameId !== gameId) {
    return <ErrorMessage>Game not found!</ErrorMessage>;
  }

  if (gameStateStatus !== 'success' || !renderGameState) {
    return <ErrorMessage>Error! Something went wrong.</ErrorMessage>;
  }

  return (
    <Flex w="full" gap={2}>
      <InteractiveGoBoard flex={1} gameState={renderGameState} />
      <GameStatusBox gameState={renderGameState} />
    </Flex>
  );
}
