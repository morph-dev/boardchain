import { SquareProps, Square } from '@chakra-ui/react';
import { BoardState } from '../../types';
import { XSymbol, OSymbol } from '../Symbols';

export interface BoardCellProps extends SquareProps {
  value: BoardState;
  isWinCell?: boolean;
  dim?: boolean;
}

export default function BoardCell({ value, isWinCell, dim, ...props }: BoardCellProps) {
  const symbolProps = {
    size: 'full',
    ...(isWinCell && { color: 'tictactoe.win' }),
    ...(dim && { opacity: 0.4 }),
  };
  return (
    <Square {...props}>
      {value === BoardState.X && <XSymbol {...symbolProps} />}
      {value === BoardState.O && <OSymbol {...symbolProps} />}
    </Square>
  );
}
