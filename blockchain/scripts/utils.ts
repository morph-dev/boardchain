const BOARD_VALUE = [' ·', '⚫', '⚪',];
//﹢＋·＋
const cellToString = (value: bigint) => BOARD_VALUE[Number(value)];
const rowToString = (row: bigint[], rowIndex: number) => row.map(cellToString).join('');
export const boardToString = (board: bigint[][]) => board.map(rowToString).join('\n');
