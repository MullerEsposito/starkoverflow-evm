import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import { PROVIDER_ICONS } from './constant';
import { formatters } from '@utils/formatters';
import {
  AddressButton,
  ChevronIcon,
  Dropdown,
  DropdownItem,
  StyledButton,
  WalletInfo,
  WalletName,
  WalletStatus,
  UserAvatar,
  DefaultAvatar
} from './style';

export function ConnectButton() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { login, logout, authenticated, user } = usePrivy();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  // Adicionar/remover listener para clique fora
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnect = () => {
    if (authenticated) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      login();
    }
  };

  const handleDisconnect = () => {
    logout();
    disconnect();
    setIsDropdownOpen(false);
  };

  const getUserInfo = () => {
    if (!user) return { name: 'Connect Wallet', image: null }

    if (user.google) {
      console.log(`user.google`, user.google);

      return {
        name: user.google.name || user.google.email?.split('@')[0] || 'Google User',
        image: (user.google as any).picture || null
      }
    }

    if (user.wallet) {
      return {
        name: 'Wallet',
        image: PROVIDER_ICONS.metaMask
      }
    }
  }

  const userInfo = getUserInfo()

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {authenticated ? (
        <AddressButton onClick={handleConnect}>
          {userInfo?.image ? (
            <UserAvatar src={userInfo.image} alt={userInfo.name} />
          ) : (
            <DefaultAvatar>
              {userInfo?.name.charAt(0).toUpperCase()}
            </DefaultAvatar>
          )}
          <WalletInfo>
            <WalletName>{userInfo?.name}</WalletName>
            <WalletStatus>{formatters.formatAddress(address || '')}</WalletStatus>
          </WalletInfo>
          <ChevronIcon $isOpen={isDropdownOpen} />
        </AddressButton>
      ) : (
        <StyledButton onClick={handleConnect}>Connect Wallet</StyledButton>
      )}

      {isDropdownOpen && (
        <Dropdown $isOpen={isDropdownOpen}>
          <DropdownItem onClick={handleDisconnect}>Disconnect</DropdownItem>
        </Dropdown>
      )}
    </div>
  );
}