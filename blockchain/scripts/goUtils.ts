import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { GoLobby, GoGame } from '../typechain-types/go';
import { getEvent } from './utils';

const BOARD_VALUE = [' ·', '⚫', '⚪'];
//﹢＋·＋⬤◯ ◉○●◎  •◦ ⦿ ⊚ ◎◉○⊙

function boardToString(board: bigint[][]): string {
  const cellToString = (value: bigint) => BOARD_VALUE[Number(value)];
  const rowToString = (row: bigint[]) => row.map(cellToString).join('');
  return board.map(rowToString).join('\n');
}

function scoringBoardToString(board: bigint[][], scoringBoard: bigint[][]): string {
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

async function printGame(go: GoGame, gameId: bigint) {
  const { phase, result, board, playingState, scoringState } = await go.getGameState(gameId);
  console.log('GameId:', gameId.toString(16));
  console.log('Phase:', phase);
  console.log('Prisoners:', Array.from(playingState.prisoners));
  if (phase == 1n) {
    console.log('Last move:', Array.from(playingState.lastMove));
    console.log(boardToString(board));
  }
  if (phase == 2n) {
    console.log('ScoringState:');
    console.log('  accepted:', Array.from(scoringState.accepted));
    console.log('  boardPrisoners:', Array.from(scoringState.boardPrisoners));
    console.log('  territory:', Array.from(scoringState.territory));
    console.log(scoringBoardToString(board, scoringState.board));
  }
  if (phase == 3n) {
    console.log('Result', Array.from(result));
    console.log(scoringBoardToString(board, scoringState.board));
  }
}

export async function startGame(
  lobby: GoLobby,
  go: GoGame,
  blackPlayer: SignerWithAddress,
  whitePlayer: SignerWithAddress,
  boardSize = 9
): Promise<bigint> {
  const tx = await lobby.connect(blackPlayer).createChallenge(whitePlayer, boardSize, true);
  const gameId = await getEvent(tx, 'ChallengeCreated').then(
    (event) => event?.args.getValue('gameId') as bigint
  );

  await lobby
    .connect(whitePlayer)
    .acceptDirectChallenge(gameId)
    .then((tx) => tx.wait());

  await printGame(go, gameId);

  return gameId;
}

export function playStone(
  go: GoGame,
  gameId: bigint,
  player: SignerWithAddress,
  x: number,
  y: number
) {
  return go
    .connect(player)
    .playStone(gameId, x, y)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

export function pass(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .pass(gameId)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

export function markGroup(
  go: GoGame,
  gameId: bigint,
  player: SignerWithAddress,
  x: number,
  y: number,
  dead: boolean
) {
  return go
    .connect(player)
    .markGroup(gameId, x, y, dead)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

export function acceptScoring(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .acceptScoring(gameId)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}
