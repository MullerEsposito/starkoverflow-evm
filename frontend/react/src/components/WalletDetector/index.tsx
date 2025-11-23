import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

export function WalletDetector() {
  const { isConnected, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();

  // Tentar reconectar automaticamente se houver uma sessão ativa
  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      const connector = connectors.find((c) => c.ready);
      if (connector) {
        connect({ connector });
      }
    }
  }, [isConnected, isReconnecting, connect, connectors]);

  return null; // Este componente não renderiza nada na UI
}
