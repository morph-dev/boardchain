const BOARD_VALUE = ['   ', ' X ', ' O '];
const cellToString = (value: number) => BOARD_VALUE[value];
const rowToString = (row: number[]) => row.map(cellToString).join('│');
export const boardToString = (board: number[][]) => board.map(rowToString).join('\n───┼───┼───\n');
