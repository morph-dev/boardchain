import { deployGo, deployTicTacToe, giveEther } from './setup';

const addresses = [
  '0x18e24B27B6152595B9545C1757280EDc46545545',
  '0x4557971a9331Df1BdF0Cd94cfA7BB05f02A27905',
  '0x6a66599F55B4bBa4F4aAFdD73eb63D7A9893Ae5a',
];

async function main() {
  await deployTicTacToe();
  await deployGo();

  await giveEther(addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
