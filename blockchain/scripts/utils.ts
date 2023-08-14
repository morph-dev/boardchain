import { ContractTransactionResponse, EventLog } from 'ethers';

const BOARD_VALUE = [' ·', '⚫', '⚪'];
//﹢＋·＋⬤◯ ◉○●◎  •◦ ⦿ ⊚ ◎◉○⊙

export function boardToString(board: bigint[][]): string {
  const cellToString = (value: bigint) => BOARD_VALUE[Number(value)];
  const rowToString = (row: bigint[]) => row.map(cellToString).join('');
  return board.map(rowToString).join('\n');
}

export function scoringBoardToString(board: bigint[][], scoringBoard: bigint[][]): string {
  const cellToString = (value: bigint, row: number, column: number) => {
    switch (value) {
      case 0n:
        return ' ?';
      case 1n:
        return ' ·';
      case 2n:
        return ' •';
      case 3n:
        return ' ◦';
      case 4n:
        return board[row][column] === 1n ? '● ' : '○ ';
      case 5n:
        return board[row][column] === 1n ? '⚫' : '⚪';
    }
  };
  const rowToString = (row: bigint[], rowIndex: number) =>
    row.map((value, column) => cellToString(value, rowIndex, column)).join('');

  return scoringBoard.map(rowToString).join('\n');
}

export async function getEvents(tx: ContractTransactionResponse): Promise<EventLog[]> {
  const receipt = await tx.wait();
  if (!receipt) {
    return [];
  }
  return receipt.logs.filter((event): event is EventLog => 'eventName' in event);
}

export async function getEvent(
  tx: ContractTransactionResponse,
  eventName: string
): Promise<EventLog | undefined> {
  return getEvents(tx).then((events) => events.find((event) => event.eventName == eventName));
}
