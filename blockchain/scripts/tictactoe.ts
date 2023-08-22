import { ethers } from 'hardhat';
import { TicTacToeLobby, TicTacToe } from '../typechain-types/tictactoe';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { getEvent } from './utils';
import { deployTicTacToe } from './setup';

const BOARD_VALUE = ['   ', ' X ', ' O '];
const cellToString = (value: bigint) => BOARD_VALUE[Number(value)];
const rowToString = (row: bigint[]) => row.map(cellToString).join('│');
const boardToString = (board: bigint[][]) => board.map(rowToString).join('\n───┼───┼───\n');

async function printGame(ticTacToe: TicTacToe, gameId: bigint) {
  const game = await ticTacToe.game(gameId);
  console.log('GameId:', gameId.toString(16));
  console.log('Phase:', game.phase);
  if (game.phase == 2n) {
    console.log('Result:', game.result);
  }
  console.log(boardToString(game.board));
}

async function startGame(
  lobby: TicTacToeLobby,
  ticTacToe: TicTacToe,
  playerX: SignerWithAddress,
  playerO: SignerWithAddress
): Promise<bigint> {
  const event = await lobby
    .connect(playerX)
    .createChallenge(true, playerO.address)
    .then((tx) => getEvent(tx, 'ChallengeCreated'));
  const gameId = event?.args.getValue('gameId') as bigint;

  await lobby
    .connect(playerO)
    .acceptDirectChallenge(gameId)
    .then((tx) => tx.wait());

  await printGame(ticTacToe, gameId);
  return gameId;
}

async function playMove(
  ticTacToe: TicTacToe,
  gameId: bigint,
  player: SignerWithAddress,
  x: number,
  y: number
) {
  await ticTacToe
    .connect(player)
    .playMove(gameId, x, y)
    .then((tx) => tx.wait());

  await printGame(ticTacToe, gameId);
}

async function main() {
  const [player1, player2] = await ethers.getSigners();

  const [lobby, ticTacToe] = await deployTicTacToe();
  lobby.connect(player1).createChallenge(true, player2);

  const gameId = await startGame(lobby, ticTacToe, player1, player2);

  await playMove(ticTacToe, gameId, player1, 1, 1);
  await playMove(ticTacToe, gameId, player2, 2, 0);
  await playMove(ticTacToe, gameId, player1, 0, 0);
  await playMove(ticTacToe, gameId, player2, 2, 2);
  await playMove(ticTacToe, gameId, player1, 0, 2);
  await playMove(ticTacToe, gameId, player2, 0, 1);
  await playMove(ticTacToe, gameId, player1, 2, 1);
  await playMove(ticTacToe, gameId, player2, 1, 0);
  await playMove(ticTacToe, gameId, player1, 1, 2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
