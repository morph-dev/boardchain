import { deployGo, deployTicTacToe } from './setup';

async function main() {
  await deployTicTacToe();
  await deployGo();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
