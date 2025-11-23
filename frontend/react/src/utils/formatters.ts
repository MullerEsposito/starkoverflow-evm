// src/utils/formatters.ts

// Tipos para formatação
export type Address = `0x${string}`;
export type HexString = `0x${string}`;
export type Wei = bigint;
export type Ether = number;

export const formatters = {
  // Formata um endereço Ethereum para exibição (0x1234...5678)
  formatAddress: (address: Address | string | null | undefined): string => {
    if (!address) return '';
    const addr = address.startsWith('0x') ? address : `0x${address}`;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  },

  // Converte wei para ether (1 ether = 10^18 wei)
  weiToEther: (wei: Wei | bigint | string): number => {
    const weiBigInt = typeof wei === 'string' ? BigInt(wei) : BigInt(wei.toString());
    return Number(weiBigInt) / 1e18;
  },

  // Converte ether para wei
  etherToWei: (ether: Ether | string): bigint => {
    const etherNum = typeof ether === 'string' ? parseFloat(ether) : ether;
    return BigInt(Math.floor(etherNum * 1e18));
  },

  // Formata um valor em wei para ETH com casas decimais
  formatEther: (wei: Wei | bigint | string, decimals = 4): string => {
    const ether = formatters.weiToEther(wei);
    return formatters.formatNumber(ether, decimals);
  },

  // Formata um número com um número específico de casas decimais
  formatNumber: (num: number, decimals = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  },

  // Converte um número ou string para wei (BigInt)
  toWei: (value: string | number): bigint => {
    if (typeof value === 'number') {
      return BigInt(Math.floor(value * 1e18));
    }
    const [integer, decimal = '0'] = value.split('.');
    const decimalPart = decimal.padEnd(18, '0').substring(0, 18);
    return BigInt(integer + decimalPart);
  },

  // Verifica se uma string é um endereço Ethereum válido
  isAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Formata um hash de transação para exibição
  formatTransactionHash: (hash: string): string => {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  },

  // Converte um valor em wei para uma string com unidade
  formatTokenAmount: (amount: Wei | string, decimals = 18, symbol = ''): string => {
    const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
    const divisor = BigInt(10) ** BigInt(decimals);
    const integer = amountBigInt / divisor;
    const fractional = amountBigInt % divisor;
    
    let result = integer.toString();
    if (fractional > 0n) {
      const fractionalStr = fractional.toString().padStart(decimals, '0');
      result += `.${fractionalStr}`.replace(/0+$/, '');
    }
    
    return symbol ? `${result} ${symbol}` : result;
  }
};

// Exporta funções individuais para facilitar a importação
export const {
  formatAddress,
  weiToEther,
  etherToWei,
  formatEther,
  formatNumber,
  toWei,
  isAddress,
  formatTransactionHash,
  formatTokenAmount
} = formatters;