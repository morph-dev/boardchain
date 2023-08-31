import { ethers } from 'hardhat';
import { acceptScoring, markGroup, pass, playStone, startGame } from './goUtils';
import { deployGo } from './setup';

async function main() {
  const [lobby, go] = await deployGo();

  const [signer1, signer2] = await ethers.getSigners();
  const { gameId, blackPlayer, whitePlayer } = await startGame(lobby, go, signer1, signer2, 9);

  console.log('GameStarted:', gameId.toString(16));

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
  await playStone(go, gameId, blackPlayer, 2, 6);
  await playStone(go, gameId, whitePlayer, 1, 6);
  await playStone(go, gameId, blackPlayer, 2, 7);
  await playStone(go, gameId, whitePlayer, 1, 7);

  await playStone(go, gameId, blackPlayer, 0, 6);
  await playStone(go, gameId, whitePlayer, 1, 1);

  await pass(go, gameId, blackPlayer);
  await pass(go, gameId, whitePlayer);
  await markGroup(go, gameId, blackPlayer, 1, 1, true);
  await markGroup(go, gameId, blackPlayer, 2, 6, true);
  await markGroup(go, gameId, whitePlayer, 2, 7, false);
  await markGroup(go, gameId, whitePlayer, 2, 6, true);
  await markGroup(go, gameId, whitePlayer, 0, 6, true);

  await acceptScoring(go, gameId, whitePlayer);
  // await acceptScoring(go, gameId, blackPlayer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
