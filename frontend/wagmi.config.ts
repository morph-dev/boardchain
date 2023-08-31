import chains from '@wagmi/chains';
import { defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/generated/blockchain.ts',
  contracts: [],
  plugins: [
    react(),
    hardhat({
      project: '../blockchain',
      commands: {
        clean: 'yarn hardhat clean',
        build: 'yarn hardhat compile',
        rebuild: 'yarn hardhat compile',
      },
      deployments: {
        TicTacToeLobby: {
          [chains.hardhat.id]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          [chains.sepolia.id]: '0x2C37171FdA079C7E79DefEf3B0A2E0C5BF182b4A',
        },
        TicTacToe: {
          [chains.hardhat.id]: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be',
          [chains.sepolia.id]: '0xC7e45Bae360248cb8150Df93bCD1f10c86148F82',
        },
        GoLobby: {
          [chains.hardhat.id]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          [chains.sepolia.id]: '0xD7ca2476Ae959e6bcA56Db9e472bD435B4E10Fad',
        },
        GoGame: {
          [chains.hardhat.id]: '0xCafac3dD18aC6c6e92c921884f9E4176737C052c',
          [chains.sepolia.id]: '0x6DBbDC25f48d2a5aA2Af4Ee2381360070ddC03da',
        },
      },
    }),
  ],
});
