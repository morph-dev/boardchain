import { ethers } from 'hardhat';
import { TicTacToe, TicTacToe__factory } from '../typechain-types';
import { CoordinatesStruct } from '../typechain-types/TicTacToe';
import { boardToString } from './utils';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { EventLog } from 'ethers';

export async function deployTicTacToe() {
  const TicTacToe: TicTacToe__factory = await ethers.getContractFactory('TicTacToe');
  const ticTacToe = await TicTacToe.deploy();
  console.log('TicTacToe deployed to:', await ticTacToe.getAddress());
  return ticTacToe;
}

async function startGame(
  ticTacToe: TicTacToe,
  player1: SignerWithAddress,
  player2: SignerWithAddress
): Promise<bigint> {
  const tx = await ticTacToe.connect(player1).newGame(player1.address, player2.address);
  const txReceipt = await tx.wait();

  return txReceipt?.logs
    .find((event): event is EventLog => 'eventName' in event && event.eventName === 'GameStarted')
    ?.args.getValue('gameId');
}

async function playMove(
  ticTacToe: TicTacToe,
  gameId: bigint,
  player: SignerWithAddress,
  coordinates: CoordinatesStruct
) {
  const tx = await ticTacToe.connect(player).playMove(gameId, coordinates);
  await tx.wait();

  await printGame(ticTacToe, gameId);
}

async function printGame(ticTacToe: TicTacToe, gameId: bigint) {
  const { status } = await ticTacToe.games(gameId);
  console.log('GameId:', gameId.toString(16));
  console.log('Phase:', status.phase);
  console.log('Result:', status.result);
  const board = await ticTacToe.boardState(gameId);
  console.log(boardToString(board));
}

async function main() {
  const ticTacToe = await deployTicTacToe();

  const [player1, player2] = await ethers.getSigners();
  const gameId = await startGame(ticTacToe, player1, player2);
  console.log('GameStarted:', gameId.toString(16));

  await printGame(ticTacToe, gameId);

  await playMove(ticTacToe, gameId, player1, { row: 1, column: 1 });
  await playMove(ticTacToe, gameId, player2, { row: 2, column: 0 });
  await playMove(ticTacToe, gameId, player1, { row: 0, column: 0 });
  await playMove(ticTacToe, gameId, player2, { row: 2, column: 1 });
  await playMove(ticTacToe, gameId, player1, { row: 2, column: 2 });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
