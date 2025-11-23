import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

interface EvmPrivyProviderProps {
  children: React.ReactNode;
}

export function EvmPrivyProvider({ children }: EvmPrivyProviderProps) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID ?? "cmialv1ko022il80cq0bp1qn6";

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["wallet", "google"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

export default EvmPrivyProvider;
