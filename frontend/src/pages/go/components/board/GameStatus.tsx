import { Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { GameFullStateType, GamePhase, Player } from '../../types';

export type GameStatusProps = {
  gameState: GameFullStateType;
  isPending: boolean;
  canPass: boolean;
  canAcceptScoring: boolean;
  onPass: () => void;
  onAcceptScoring: () => void;
};

export default function GameStatus({
  gameState,
  isPending,
  canPass,
  canAcceptScoring,
  onPass,
  onAcceptScoring,
}: GameStatusProps) {
  if (gameState.phase === GamePhase.Playing) {
    return (
      <Flex w="full" align="center">
        <Text fontWeight="bold">
          {gameState.playingState.currentPlayer === Player.Black ? 'Black' : 'White'} to play
        </Text>
        <Spacer />
        <Button size="sm" isLoading={isPending} isDisabled={!canPass} onClick={onPass}>
          Pass
        </Button>
      </Flex>
    );
  }

  if (gameState.phase === GamePhase.Scoring) {
    return (
      <Flex w="full" align="center">
        <Text fontWeight="bold">Scoring</Text>
        <Spacer />
        <Button
          size="sm"
          isLoading={isPending}
          isDisabled={!canAcceptScoring}
          onClick={onAcceptScoring}
        >
          Accept Score
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
