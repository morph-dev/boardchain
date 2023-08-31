import { ChakraProps, VStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from '../../../../providers/AppContext';
import { BoardState, Coordinates, GameFullStateType, GamePhase, Player } from '../../types';
import GameStatus from './GameStatus';
import GoBoard, { GoBoardProps } from './GoBoard';
import { Action, ActionType, useActions } from './actions';

export type InteractiveGoBoardProps = {
  gameState: GameFullStateType;
} & ChakraProps;

export default function InteractiveGoBoard({ gameState, ...props }: InteractiveGoBoardProps) {
  const { userAddress } = useAppContext();

  const [pendingAction, setPendingAction] = useState<Action | null>(null);

  const [hover, setHover] = useState<Coordinates | undefined>(undefined);

  const board = gameState.board;

  const playerColor =
    userAddress === gameState.players[0]
      ? Player.Black
      : userAddress === gameState.players[1]
      ? Player.White
      : null;

  const {
    canPlayStoneOrPass,
    canMarkDeadAliveOrAcceptScoring,
    onPlayStone,
    onPass,
    onMarkDeadAlive,
    onAcceptScoring,
  } = useActions(gameState, pendingAction, setPendingAction);

  // Dim - pending play stone or can play stone with hover
  const dim = useMemo<GoBoardProps['dim']>(() => {
    if (pendingAction && pendingAction.type === ActionType.PlayStone && playerColor !== null) {
      return {
        state: playerColor === Player.Black ? BoardState.Black : BoardState.White,
        ...pendingAction.coordinates,
      };
    } else if (
      pendingAction === null &&
      canPlayStoneOrPass &&
      hover &&
      board[hover.x][hover.y] === BoardState.Empty
    ) {
      return {
        state: playerColor === Player.Black ? BoardState.Black : BoardState.White,
        ...hover,
      };
    } else {
      return undefined;
    }
  }, [canPlayStoneOrPass, board, hover, pendingAction, playerColor]);

  // ToogleDeadAlive - pending dead/alive or can mark dead/alive and hover
  const toogleDeadAlive = useMemo<GoBoardProps['toogleDeadAlive']>(() => {
    if (pendingAction && pendingAction.type === ActionType.MarkDeadAlive && playerColor !== null) {
      return { ...pendingAction.coordinates };
    } else if (
      pendingAction === null &&
      canMarkDeadAliveOrAcceptScoring &&
      hover &&
      board[hover.x][hover.y] !== BoardState.Empty
    ) {
      return { ...hover };
    } else {
      return undefined;
    }
  }, [board, canMarkDeadAliveOrAcceptScoring, hover, pendingAction, playerColor]);

  const onClick = useCallback(
    (c: Coordinates) => {
      if (gameState.phase === GamePhase.Playing) {
        onPlayStone(c);
      }
      if (gameState.phase === GamePhase.Scoring) {
        onMarkDeadAlive(c);
      }
    },
    [gameState.phase, onMarkDeadAlive, onPlayStone]
  );

  return (
    <VStack {...props}>
      <GameStatus
        gameState={gameState}
        isPending={pendingAction !== null}
        canPass={canPlayStoneOrPass}
        canAcceptScoring={canMarkDeadAliveOrAcceptScoring}
        onPass={onPass}
        onAcceptScoring={onAcceptScoring}
      />
      <GoBoard
        gameState={gameState}
        dim={dim}
        toogleDeadAlive={toogleDeadAlive}
        onClick={onClick}
        onMouseMove={setHover}
        onMouseLeave={() => setHover(undefined)}
      />
    </VStack>
  );
}
