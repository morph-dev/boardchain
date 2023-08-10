const BOARD_VALUE = ['   ', ' X ', ' O '];
const cellToString = (value: bigint) => BOARD_VALUE[Number(value)];
const rowToString = (row: bigint[]) => row.map(cellToString).join('│');
export const boardToString = (board: bigint[][]) => board.map(rowToString).join('\n───┼───┼───\n');
