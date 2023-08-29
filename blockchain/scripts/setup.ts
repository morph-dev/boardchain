import { ethers } from 'hardhat';
import { TicTacToeLobby, TicTacToe } from '../typechain-types/tictactoe';
import { GoLobby, GoGame } from '../typechain-types/';

export async function giveEther(addresses: string[]): Promise<void> {
  const [owner] = await ethers.getSigners();

  for (const address of addresses) {
    if (owner.address !== address) {
      await owner.sendTransaction({
        to: address,
        value: ethers.parseEther('1'),
      });
    }
  }
}

export async function deployTicTacToe(): Promise<[TicTacToeLobby, TicTacToe]> {
  const lobby = await ethers
    .deployContract('TicTacToeLobby')
    .then((lobby) => lobby.waitForDeployment());
  const ticTacToe = await ethers.getContractAt('TicTacToe', await lobby.ticTacToe());
  console.log('TicTacToeLobby deployed:\n\t', await lobby.getAddress());
  console.log('TicTacToe deployed:\n\t', await ticTacToe.getAddress());
  return [lobby, ticTacToe];
}

export async function deployGo(): Promise<[GoLobby, GoGame]> {
  const lobby = await ethers.deployContract('GoLobby').then((lobby) => lobby.waitForDeployment());
  const go = await ethers.getContractAt('GoGame', await lobby.goGame());
  console.log('GoLobby deployed:\n\t', await lobby.getAddress());
  console.log('GoGame deployed:\n\t', await go.getAddress());
  return [lobby, go];
}
