import { Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { GameFullStateType, GamePhase } from '../../types';
import { getGameStatus } from '../utils/summary';

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
  if (gameState.phase === GamePhase.Playing) {
    return (
      <Flex w="full" gap={2} align="center">
        <Text fontWeight="bold">{getGameStatus(gameState, false /* =short */)}</Text>
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
        <Text fontWeight="bold">{getGameStatus(gameState, false /* =short */)}</Text>
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
    <Text fontWeight="bold">{getGameStatus(gameState, false /* =short */)}</Text>;
  }

  return (
    <Flex>
      <Text fontWeight="bold">Unknown game</Text>
    </Flex>
  );
}
