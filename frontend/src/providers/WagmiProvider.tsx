import { PropsWithChildren } from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { SUPPORTED_CHAINS } from '../utils/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function WagmiProvider({ children }: PropsWithChildren) {
  const { chains, publicClient, webSocketPublicClient } = configureChains(
    Array.from(SUPPORTED_CHAINS),
    [alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_KEY_GOERLI }), publicProvider()]
  );

  const config = createConfig({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains }), new InjectedConnector({ chains })],
    publicClient,
    webSocketPublicClient,
  });

  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
