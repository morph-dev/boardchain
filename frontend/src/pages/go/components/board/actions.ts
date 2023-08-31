import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { GetFunctionArgs, InferFunctionName } from 'viem';
import { PrepareWriteContractConfig, prepareWriteContract, writeContract } from 'wagmi/actions';
import { goGameABI, goGameAddress } from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';
import {
  BoardState,
  Coordinates,
  GameFullStateType,
  GamePhase,
  Player,
  ScoringBoardState,
} from '../../types';

export enum ActionType {
  PlayStone,
  Pass,
  MarkDeadAlive,
  AcceptScoring,
}

export type Action =
  | {
      type: ActionType.PlayStone;
      coordinates: Coordinates;
    }
  | { type: ActionType.Pass }
  | {
      type: ActionType.MarkDeadAlive;
      coordinates: Coordinates;
    }
  | { type: ActionType.AcceptScoring };

export type Actions = {
  canPlayStoneOrPass: boolean;
  canMarkDeadAliveOrAcceptScoring: boolean;
  onPlayStone: (c: Coordinates) => void;
  onPass: () => void;
  onMarkDeadAlive: (c: Coordinates) => void;
  onAcceptScoring: () => void;
};

export function useActions(
  gameState: GameFullStateType,
  pendingAction: Action | null,
  setPendingAction: (action: Action | null) => void
): Actions {
  const { chainId, userAddress } = useAppContext();
  const toast = useToast();

  const playerColor =
    userAddress === gameState.players[0]
      ? Player.Black
      : userAddress === gameState.players[1]
      ? Player.White
      : null;

  const canPlayStoneOrPass =
    gameState.phase === GamePhase.Playing && playerColor === gameState.playingState.currentPlayer;

  const canMarkDeadAliveOrAcceptScoring =
    gameState.phase === GamePhase.Scoring && playerColor !== null;

  const executeAction = useCallback(
    <FN extends string>(
      execute: boolean,
      action: Action,
      config: {
        functionName: InferFunctionName<typeof goGameABI, FN, 'nonpayable'>;
        args: GetFunctionArgs<typeof goGameABI, FN>['args'];
      },
      [successMessage, errorMessage, loadingMessage]: [string, string, string]
    ) => {
      if (pendingAction !== null || !execute) {
        return;
      }

      setPendingAction(action);
      toast.promise(
        prepareWriteContract({
          abi: goGameABI,
          address: goGameAddress[chainId],
          chainId: chainId,
          ...config,
        } as PrepareWriteContractConfig)
          .then(writeContract)
          .finally(() => setPendingAction(null)),
        {
          success: { title: successMessage },
          error: { title: errorMessage },
          loading: { title: loadingMessage },
        }
      );
    },
    [chainId, pendingAction, setPendingAction, toast]
  );

  const onPlayStone = useCallback(
    (c: Coordinates) =>
      executeAction(
        canPlayStoneOrPass && gameState.board[c.x][c.y] === BoardState.Empty,
        { type: ActionType.PlayStone, coordinates: c },
        { functionName: 'playStone', args: [gameState.info.gameId, c.x, c.y] },
        ['Played', 'Error playing the move', 'Playing']
      ),
    [canPlayStoneOrPass, gameState.board, gameState.info.gameId, executeAction]
  );

  const onPass = useCallback(
    () =>
      executeAction(
        canPlayStoneOrPass,
        { type: ActionType.Pass },
        { functionName: 'pass', args: [gameState.info.gameId] },
        ['Passed', 'Error passing', 'Passing']
      ),
    [canPlayStoneOrPass, gameState.info.gameId, executeAction]
  );

  const onMarkDeadAlive = useCallback(
    (c: Coordinates) =>
      executeAction(
        canMarkDeadAliveOrAcceptScoring && gameState.board[c.x][c.y] !== BoardState.Empty,
        { type: ActionType.MarkDeadAlive, coordinates: c },
        {
          functionName: 'markGroup',
          args: [
            gameState.info.gameId,
            c.x,
            c.y,
            gameState.scoringState.board[c.x][c.y] === ScoringBoardState.Alive,
          ],
        },
        ['Group marked', 'Error marking the group', 'Marking group']
      ),
    [
      canMarkDeadAliveOrAcceptScoring,
      gameState.board,
      gameState.info.gameId,
      gameState.scoringState.board,
      executeAction,
    ]
  );

  const onAcceptScoring = useCallback(
    () =>
      executeAction(
        canMarkDeadAliveOrAcceptScoring,
        { type: ActionType.AcceptScoring },
        { functionName: 'acceptScoring', args: [gameState.info.gameId] },
        ['Scoring accepted', 'Error accepting the score', 'Accepting the score']
      ),
    [canMarkDeadAliveOrAcceptScoring, gameState.info.gameId, executeAction]
  );

  return {
    canPlayStoneOrPass,
    canMarkDeadAliveOrAcceptScoring,
    onPlayStone,
    onPass,
    onMarkDeadAlive,
    onAcceptScoring,
  };
}
