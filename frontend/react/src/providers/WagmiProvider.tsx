import { createConfig, WagmiProvider as WagmiProviderV2, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia } from 'viem/chains';
import React from 'react';

// Set up the query client for React Query
const queryClient = new QueryClient();

// Configure the Wagmi client
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(import.meta.env.VITE_RPC_URL || 'https://sepolia.base.org'),
  },
  // Increase polling frequency for faster updates
  pollingInterval: 1_000,
});

interface WagmiProviderProps {
  children: React.ReactNode;
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProviderV2 config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderV2>
  );
}

export default WagmiProvider;
