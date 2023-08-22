import { goerli, hardhat } from '@wagmi/chains';

export const SUPPORTED_CHAINS = [hardhat, goerli] as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

export type SupportedChainId = SupportedChain['id'];

export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAINS.some((chain) => chain.id === chainId);
}

export function getDefaultChain(): SupportedChain {
  const chain = SUPPORTED_CHAINS.find(
    (chain) => chain.network === import.meta.env.VITE_DEFAULT_NETWORK
  );
  if (!chain) {
    throw Error('Default network is not supported!');
  }
  return chain;
}
