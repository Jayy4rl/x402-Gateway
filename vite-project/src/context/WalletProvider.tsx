import React, { useMemo, useCallback } from 'react';
import type { FC } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Configure network (mainnet-beta, testnet, devnet)
  // TODO: Update this to match your desired network
  const network = WalletAdapterNetwork.Devnet;

  // RPC endpoint
  // TODO: Replace with your own RPC endpoint for production
  // You can use services like Helius, QuickNode, or Alchemy
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Add more wallet adapters as needed
    ],
    []
  );

  const onError = useCallback((error: Error) => {
    console.error('Wallet error:', error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider 
        wallets={wallets} 
        onError={onError}
        autoConnect={false}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
