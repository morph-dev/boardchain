import { ethers } from 'hardhat';
import { deployGo, deployTicTacToe, giveEther } from './setup';
import { playStone, startGame } from './goUtils';

const addresses = [
  '0x18e24B27B6152595B9545C1757280EDc46545545',
  '0x4557971a9331Df1BdF0Cd94cfA7BB05f02A27905',
];

async function main() {
  const [wallet] = await ethers.getSigners();

  await deployTicTacToe();
  const goGame = await deployGo();

  await giveEther(addresses);

  const gameId = await startGame(wallet, goGame, wallet.address, addresses[0], 9);
  await playStone(goGame, gameId, wallet, 3, 3);

  await startGame(wallet, goGame, addresses[1], wallet.address, 9);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
