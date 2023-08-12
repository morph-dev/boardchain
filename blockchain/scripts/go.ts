import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { EventLog } from 'ethers';
import { ethers } from 'hardhat';
import { GoGame } from '../typechain-types';
import { boardToString } from './utils';

export async function deployGo(): Promise<GoGame> {
  const goFactory = await ethers.getContractFactory('GoGame');
  const go = await goFactory.deploy().then((gg) => gg.waitForDeployment());
  console.log('GoGame deployed to:', await go.getAddress());
  return go;
}

async function printGame(go: GoGame, gameId: bigint) {
  const { phase, result, board, playingState, scoringState } = await go.getGameState(gameId);
  console.log('GameId:', gameId.toString(16));
  console.log('Phase:', phase);
  console.log('Prisoners:', Array.from(playingState.prisoners));
  if (phase == 1n) {
    console.log('Last move:', Array.from(playingState.lastMove));
  }
  if (phase == 2n) {
    console.log('ScoringState:');
    console.log('  accepted:', Array.from(scoringState.accepted));
    console.log('  boardPrisoners:', Array.from(scoringState.boardPrisoners));
    console.log('  territory:', Array.from(scoringState.territory));
    console.log('  board:', Array.from(scoringState.board.map((r) => r.join(' '))));
  }
  if (phase == 3n) {
    console.log('Result', Array.from(result));
  }
  console.log(boardToString(board));
}

async function startGame(
  go: GoGame,
  blackPlayer: SignerWithAddress,
  whitePlayer: SignerWithAddress,
  boardSize = 9,
  komi = 6,
  handicap = 0
): Promise<bigint> {
  const tx = await go.startGame(
    blackPlayer.address,
    whitePlayer.address,
    boardSize,
    komi,
    handicap
  );
  const txReceipt = await tx.wait();

  const gameId = txReceipt?.logs
    .find((event): event is EventLog => 'eventName' in event && event.eventName === 'GameStarted')
    ?.args.getValue('gameId');

  printGame(go, gameId);

  return gameId;
}

function playStone(go: GoGame, gameId: bigint, player: SignerWithAddress, x: number, y: number) {
  return go
    .connect(player)
    .playStone(gameId, x, y)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

function pass(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .pass(gameId)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

function markGroup(
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

function acceptScoring(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .acceptScoring(gameId)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

async function main() {
  const go = await deployGo();

  const [blackPlayer, whitePlayer] = await ethers.getSigners();
  const gameId = await startGame(go, blackPlayer, whitePlayer, 9, 6, 2);
  console.log('GameStarted:', gameId.toString(16));

  await playStone(go, gameId, whitePlayer, 1, 6);
  await playStone(go, gameId, blackPlayer, 0, 4);
  await playStone(go, gameId, whitePlayer, 0, 5);
  await playStone(go, gameId, blackPlayer, 1, 4);
  await playStone(go, gameId, whitePlayer, 1, 5);
  await playStone(go, gameId, blackPlayer, 2, 4);
  await playStone(go, gameId, whitePlayer, 2, 5);
  await playStone(go, gameId, blackPlayer, 3, 5);
  await playStone(go, gameId, whitePlayer, 3, 6);
  await playStone(go, gameId, blackPlayer, 4, 5);
  await playStone(go, gameId, whitePlayer, 4, 6);
  await playStone(go, gameId, blackPlayer, 5, 5);
  await playStone(go, gameId, whitePlayer, 5, 6);
  await playStone(go, gameId, blackPlayer, 6, 5);
  await playStone(go, gameId, whitePlayer, 6, 6);
  await playStone(go, gameId, blackPlayer, 7, 4);
  await playStone(go, gameId, whitePlayer, 7, 5);
  await playStone(go, gameId, blackPlayer, 8, 4);
  await playStone(go, gameId, whitePlayer, 8, 5);

  await playStone(go, gameId, blackPlayer, 7, 6);
  await playStone(go, gameId, whitePlayer, 7, 7);
  await playStone(go, gameId, blackPlayer, 8, 6);
  await playStone(go, gameId, whitePlayer, 8, 8);
  // await playStone(go, gameId, blackPlayer, 2, 6);
  // await playStone(go, gameId, whitePlayer, 1, 6);
  await playStone(go, gameId, blackPlayer, 2, 7);
  await playStone(go, gameId, whitePlayer, 1, 7);

  await pass(go, gameId, blackPlayer);
  await pass(go, gameId, whitePlayer);
  await markGroup(go, gameId, blackPlayer, 2, 6, true);
  await markGroup(go, gameId, whitePlayer, 2, 7, false);
  await markGroup(go, gameId, whitePlayer, 2, 6, true);
  await markGroup(go, gameId, blackPlayer, 2, 6, true);
  await acceptScoring(go, gameId, whitePlayer);
  await acceptScoring(go, gameId, blackPlayer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
