import { useCallback, useState } from 'react';
import { isAddressEqual } from 'viem';
import { prepareWriteContract, writeContract } from 'wagmi/actions';
import { ticTacToeABI, ticTacToeAddress } from '../../../../generated/blockchain';
import { useErrorHandler } from '../../../../hooks/useErrorHandler';
import { useAppContext } from '../../../../providers/AppContext';
import { BoardState, GamePhase, GameState } from '../../types';
import Board, { BoardProps, Coordinates } from './Board';

export interface InteractiveBoardProps
  extends Omit<BoardProps, 'board' | 'hoverCell' | 'hoverState' | 'onCellClick'> {
  game: GameState;
}

export default function InteractiveBoard({ game, ...props }: InteractiveBoardProps) {
  const { chainId, userAddress } = useAppContext();
  const errorHandler = useErrorHandler();

  const [pendingMove, setPendingMove] = useState<Coordinates | null>(null);

  const nextPlayerIsX = game.numberOfMoves % 2 === 0;

  const canPlayMove =
    game.phase === GamePhase.InProgress &&
    !!userAddress &&
    isAddressEqual(userAddress, nextPlayerIsX ? game.playerX : game.playerO);

  const playMove = useCallback(
    (row: number, column: number) => {
      if (pendingMove !== null) {
        return;
      }

      if (!canPlayMove) {
        return;
      }

      if (game.board[row][column] !== BoardState.Empty) {
        return;
      }

      setPendingMove({ row, column });

      prepareWriteContract({
        abi: ticTacToeABI,
        address: ticTacToeAddress[chainId],
        chainId: chainId,
        functionName: 'playMove',
        args: [game.gameId, row, column],
      })
        .then(writeContract)
        .catch(errorHandler('Error playing the move'))
        .finally(() => setPendingMove(null));
    },
    [canPlayMove, chainId, errorHandler, game.board, game.gameId, pendingMove]
  );

  return (
    <Board
      board={game.board}
      hoverCell={pendingMove ?? undefined}
      hoverState={!canPlayMove ? undefined : nextPlayerIsX ? BoardState.X : BoardState.O}
      onCellClick={playMove}
      {...props}
    />
  );
}
