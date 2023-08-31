import { Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { GameFullStateType, GamePhase, Player } from '../../types';

export type GameStatusProps = {
  gameState: GameFullStateType;
  isPending: boolean;
  canPass: boolean;
  canAcceptScoring: boolean;
  acceptedScoring: boolean;
  onPass: () => void;
  onAcceptScoring: () => void;
  onResign: () => void;
};

export default function GameStatus({
  gameState,
  isPending,
  canPass,
  canAcceptScoring,
  acceptedScoring,
  onPass,
  onAcceptScoring,
  onResign,
}: GameStatusProps) {
  const playingState = gameState.playingState;

  if (gameState.phase === GamePhase.Playing) {
    return (
      <Flex w="full" gap={2} align="center">
        <Text fontWeight="bold">
          {playingState.currentPlayer === Player.Black ? 'Black' : 'White'} to play
          {playingState.numberOfMoves > 0 &&
            playingState.lastMove.isPass &&
            ` - ${playingState.currentPlayer === Player.Black ? 'White' : 'Black'} passed`}
        </Text>
        <Spacer />
        <Button size="sm" isLoading={isPending} isDisabled={!canPass} onClick={onPass}>
          Pass
        </Button>
        <Button size="sm" isLoading={isPending} onClick={onResign}>
          Resign
        </Button>
      </Flex>
    );
  }

  if (gameState.phase === GamePhase.Scoring) {
    return (
      <Flex w="full" gap={2} align="center">
        <Text fontWeight="bold">Scoring</Text>
        <Spacer />
        <Button
          size="sm"
          isLoading={isPending}
          isDisabled={!canAcceptScoring || acceptedScoring}
          onClick={onAcceptScoring}
        >
          {acceptedScoring ? 'Accepted' : 'Accept Score'}
        </Button>
        <Button size="sm" isLoading={isPending} isDisabled={!canAcceptScoring} onClick={onResign}>
          Resign
        </Button>
      </Flex>
    );
  }

  if (gameState.phase === GamePhase.Finished) {
    return <Text fontWeight="bold">{gameState.result.reason}</Text>;
  }

  return (
    <Flex>
      <Text fontWeight="bold">Unknown game</Text>
    </Flex>
  );
}
