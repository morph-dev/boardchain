import { goerli, hardhat } from '@wagmi/chains';
import { PropsWithChildren } from 'react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

export default function WagmiProvider({ children }: PropsWithChildren) {
  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [hardhat, goerli],
    [alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_KEY_GOERLI }), publicProvider()]
  );

  const config = createConfig({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    publicClient,
    webSocketPublicClient,
  });

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
