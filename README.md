# StarkOverflow EVM

A decentralized Q&A platform built on EVM with Filecoin perpetual storage via Lighthouse SDK.

## 🌟 Features

- **EVM Smart Contracts**: Built on Base Sepolia testnet
- **Filecoin Storage**: Perpetual storage of all questions and answers via Lighthouse SDK
- **IPFS Integration**: Content addressed by CID, stored on-chain
- **Wallet Integration**: Privy + Wagmi for seamless authentication
- **Token Staking**: Stake tokens on questions to incentivize quality answers
- **Forum System**: Organized Q&A by topics

## 🔗 Filecoin Integration

This project makes **significant use of Filecoin** through:

- **Perpetual Storage**: All question descriptions and answer content are uploaded to Filecoin via Lighthouse SDK
- **CID-Based Addressing**: Content identifiers (CIDs) are stored on-chain in the EVM smart contract
- **Automatic Upload**: Questions and answers are automatically uploaded to Filecoin before blockchain transaction
- **Content Retrieval**: CIDs are converted to IPFS gateway URLs for content display
- **Storage Statistics**: Track total files and storage used on Filecoin

### Lighthouse SDK Functions

```typescript
// Upload text to Filecoin
const cid = await uploadText(content, filename)

// Upload images to Filecoin
const cid = await uploadImage(file)

// Get Filecoin storage status
const status = await getFilecoinStatus(cid)

// Get total storage statistics
const stats = await getStorageStats()
```

## 🚀 Tech Stack

### Frontend
- **React** + TypeScript + Vite
- **Wagmi** + **Viem** for EVM interactions
- **Privy** for wallet authentication
- **Lighthouse SDK** for Filecoin storage
- **Styled Components** for styling

### Smart Contracts
- **Solidity** smart contracts
- **Base Sepolia** testnet
- **Hardhat** for development

## 📦 Installation

```bash
# Install dependencies
cd frontend/react
npm install

# Configure environment variables
cp .env.example .env
# Add your keys:
# - VITE_CONTRACT_ADDRESS
# - VITE_LIGHTHOUSE_API_KEY
# - VITE_PRIVY_APP_ID
```

## 🔑 Getting Lighthouse API Key

1. Visit https://files.lighthouse.storage/
2. Connect your wallet
3. Go to **API Key** → **Create New Key**
4. Copy the key and add to `.env` as `VITE_LIGHTHOUSE_API_KEY`

## 🏃 Running

```bash
# Development
npm run dev

# Build
npm run build
```

## 📝 Environment Variables

```env
# Contract
VITE_CONTRACT_ADDRESS=0x4A1058b3E8EDd3De25C7D35558176b102217EA22
VITE_TOKEN_ADDRESS=0x4200000000000000000000000000000000000006

# Filecoin/IPFS
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
VITE_IPFS_GATEWAY=https://gateway.lighthouse.storage/ipfs/

# Authentication
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

## 🎯 How It Works

1. **Ask Question**: User writes question → Content uploaded to Filecoin → CID stored on-chain
2. **Submit Answer**: User writes answer → Content uploaded to Filecoin → CID stored on-chain
3. **View Content**: CID retrieved from contract → Converted to IPFS URL → Content displayed
4. **Stake Tokens**: Users stake tokens on questions to incentivize answers
5. **Mark Correct**: Question author marks the correct answer, distributing staked tokens

## 📊 Filecoin Storage Flow

```
User Input → Lighthouse Upload → Filecoin Storage → CID Generated
                                                          ↓
                                                    Stored On-Chain
                                                          ↓
                                              Retrieved & Displayed
```

## 🔗 Links

- **Repository**: https://github.com/MullerEsposito/starkoverflow-evm
- **Contract**: Base Sepolia - `0x4A1058b3E8EDd3De25C7D35558176b102217EA22`
- **Lighthouse**: https://files.lighthouse.storage/

## 📄 License

MIT
