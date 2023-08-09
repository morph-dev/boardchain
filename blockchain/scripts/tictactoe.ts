import { ethers } from 'hardhat';
import { TicTacToe, TicTacToe__factory } from '../typechain-types';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { CoordinatesStruct } from '../typechain-types/TicTacToe';
import { boardToString } from './utils';

export async function deployTicTacToe() {
  const TicTacToe: TicTacToe__factory = await ethers.getContractFactory('TicTacToe');
  const ticTacToe = await TicTacToe.deploy();
  console.log('TicTacToe deployed to:', ticTacToe.address);
  return ticTacToe;
}

async function startGame(
  ticTacToe: TicTacToe,
  player1: SignerWithAddress,
  player2: SignerWithAddress
) {
  const tx = await ticTacToe.connect(player1).newGame(player1.address, player2.address);
  const txReceipt = await tx.wait();
  const [gameId] = txReceipt.events?.find((event) => event.event === 'GameStarted')?.args as [
    BigNumber,
    string,
    string,
  ];
  return gameId;
}

async function playMove(
  ticTacToe: TicTacToe,
  gameId: BigNumber,
  player: SignerWithAddress,
  coordinates: CoordinatesStruct
) {
  const tx = await ticTacToe.connect(player).playMove(gameId, coordinates);
  await tx.wait();

  await printGame(ticTacToe, gameId);
}

async function printGame(ticTacToe: TicTacToe, gameId: BigNumber) {
  const { status } = await ticTacToe.games(gameId);
  console.log('GameId:', gameId.toHexString());
  console.log('Phase:', status.phase);
  console.log('Result:', status.result);
  const board = await ticTacToe.boardState(gameId);
  console.log(boardToString(board));
}

async function main() {
  const ticTacToe = await deployTicTacToe();

  const [player1, player2] = await ethers.getSigners();
  const gameId = await startGame(ticTacToe, player1, player2);
  console.log('GameStarted:', gameId.toHexString());

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
