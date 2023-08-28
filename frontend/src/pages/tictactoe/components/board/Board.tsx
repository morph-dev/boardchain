import { ChakraProps, Grid, GridItem } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { BoardState, Board as BoardType } from '../../types';
import BoardCell from './BoardCell';

function getWinState(board: Readonly<BoardType>) {
  const winningCombinations: readonly (readonly (readonly [0 | 1 | 2, 0 | 1 | 2])[])[] = [
    // rows
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // columns
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // diagonals
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ] as const;

  const winState = board.map((row) => row.map(() => false));
  for (const combination of winningCombinations) {
    const state = board[combination[0][0]][combination[0][1]];
    if (state === BoardState.Empty || combination.some(([x, y]) => board[x][y] !== state)) {
      continue;
    }
    for (const [x, y] of combination) {
      winState[x][y] = true;
    }
  }
  return winState;
}

export type Coordinates = {
  row: number;
  column: number;
};

export interface BoardProps extends ChakraProps {
  board: Readonly<BoardType>;
  hoverCell?: Coordinates;
  hoverState?: BoardState;
  onCellClick?: (row: number, column: number) => void;
}

export default function Board({ board, hoverCell, hoverState, onCellClick, ...props }: BoardProps) {
  const [hover, setHover] = useState<Coordinates | null>(hoverCell ?? null);

  const isInHoveredState = useCallback(
    (row: number, column: number): boolean =>
      board[row][column] === BoardState.Empty &&
      !!hoverState &&
      !!hover &&
      hover.row === row &&
      hover.column === column,
    [board, hover, hoverState]
  );

  const winState = getWinState(board);

  return (
    <Grid
      w="full"
      minW="100px"
      maxW="500px"
      templateColumns="repeat(3, minmax(0, 1fr))"
      templateRows="repeat(3, minmax(0, 1fr))"
      gap="2%"
      bg="gray"
      aspectRatio="1"
      {...props}
    >
      {board.map((_, row) =>
        board[row].map((_, column) => (
          <GridItem key={`${row}_${column}`} bg="Background">
            <BoardCell
              size="full"
              value={hoverState && isInHoveredState(row, column) ? hoverState : board[row][column]}
              isWinCell={winState[row][column]}
              dim={isInHoveredState(row, column)}
              onClick={() => onCellClick && onCellClick(row, column)}
              onMouseEnter={() => !hoverCell && setHover({ row, column })}
              onMouseLeave={() => !hoverCell && setHover(null)}
            />
          </GridItem>
        ))
      )}
    </Grid>
  );
}
