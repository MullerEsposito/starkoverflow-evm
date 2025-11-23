import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import EvmPrivyProvider from './providers/EvmPrivyProvider';
import WagmiProvider from './providers/WagmiProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider>
      <EvmPrivyProvider>
        <App />
      </EvmPrivyProvider>
    </WagmiProvider>
  </StrictMode>
);
