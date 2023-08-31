import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { GoLobby, GoGame } from '../typechain-types/go';
import { getEventArgsFn, printHighGasUsage } from './utils';

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
    const scoringStatePreview = await go.previewScoringState(gameId);
    console.log('ScoringState:');
    console.log('  accepted:', Array.from(scoringStatePreview.accepted));
    console.log('  boardPrisoners:', Array.from(scoringStatePreview.boardPrisoners));
    console.log('  territory:', Array.from(scoringStatePreview.territory));
    console.log(scoringBoardToString(board, scoringStatePreview.board));
  }
  if (phase == 3n) {
    console.log('Result', Array.from(result));
    console.log(scoringBoardToString(board, scoringState.board));
  }
}

export async function startGame(
  lobby: GoLobby,
  go: GoGame,
  player1: SignerWithAddress,
  player2: SignerWithAddress,
  boardSize = 9
): Promise<{ gameId: bigint; blackPlayer: SignerWithAddress; whitePlayer: SignerWithAddress }> {
  const { gameId } = await lobby
    .connect(player1)
    .createChallenge(player2, boardSize)
    .then((tx) => tx.wait())
    .then(printHighGasUsage)
    .then(getEventArgsFn(lobby.getEvent('ChallengeCreated')));

  const { black: blackPlayerAddress, white: whitePlayerAddress } = await lobby
    .connect(player2)
    .acceptDirectChallenge(gameId)
    .then((tx) => tx.wait())
    .then(printHighGasUsage)
    .then(getEventArgsFn(go.getEvent('GameStarted'), go.interface));

  console.log('Players:', blackPlayerAddress, whitePlayerAddress);

  const blackPlayer = blackPlayerAddress === player1.address ? player1 : player2;
  const whitePlayer = whitePlayerAddress === player1.address ? player1 : player2;

  await printGame(go, gameId);

  return { gameId, blackPlayer, whitePlayer };
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
    .then(printHighGasUsage)
    .then(() => printGame(go, gameId));
}

export function pass(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .pass(gameId)
    .then((tx) => tx.wait())
    .then(printHighGasUsage)
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
    .then(printHighGasUsage)
    .then(() => printGame(go, gameId));
}

export function acceptScoring(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .acceptScoring(gameId)
    .then((tx) => tx.wait())
    .then(printHighGasUsage)
    .then(() => printGame(go, gameId));
}
