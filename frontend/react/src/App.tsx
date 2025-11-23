import { ThemeProvider } from "styled-components"
import { BrowserRouter } from "react-router-dom"
import { lightTheme, darkTheme } from "./styles/themes"
import { useState, useEffect } from "react"
import { GlobalStyle } from "./styles/global"
import { WalletProvider } from "./hooks/useWallet/wallet.provider"
import { EnvironmentStatus } from "./components/EnvironmentStatus"
import { ContractProvider } from "./hooks/useContract/contract.provider"
import { Header } from "./components/Header"
import { Router } from "./router"
import { WalletDetector } from "./components/WalletDetector"
import { WagmiProvider } from "./providers/WagmiProvider"
import { StatusMessageProvider } from "./hooks/useStatusMessage"

export function App() {
  const [theme, setTheme] = useState(darkTheme);

  // Try to load preferred theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setTheme(lightTheme);
    } else {
      setTheme(darkTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme === lightTheme ? "light" : "dark");
  }

  return (
    <WagmiProvider>
      <StatusMessageProvider>
        <ThemeProvider theme={theme}>
          <WalletProvider>
            <ContractProvider>
              <BrowserRouter>
                <Header toggleTheme={toggleTheme} />
                <WalletDetector />
                <Router />
              </BrowserRouter>
              <GlobalStyle />
              <EnvironmentStatus />
            </ContractProvider>
          </WalletProvider>
        </ThemeProvider>
      </StatusMessageProvider>
    </WagmiProvider>
  )
}