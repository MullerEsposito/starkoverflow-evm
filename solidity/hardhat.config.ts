import { HardhatUserConfig } from "hardhat/config";
import toolbox from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    ...toolbox,
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            viaIR: true
        }
    },
    paths: {
        sources: "./src",
        tests: "./test/hardhat",
        cache: "./cache_hardhat",
        artifacts: "./artifacts"
    },
    networks: {
        baseSepolia: {
            type: "http",
            url: process.env.BASE_SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 84532
        },
        unichainSepolia: {
            type: "http",
            url: process.env.UNICHAIN_SEPOLIA_RPC_URL || "https://sepolia.unichain.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 1301
        },
        arbitrumSepolia: {
            type: "http",
            url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 421614
        }
    },
    etherscan: {
        apiKey: process.env.BASESCAN_API_KEY || "",
        customChains: [
            {
                network: "baseSepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://api-sepolia.basescan.org/api",
                    browserURL: "https://sepolia.basescan.org"
                }
            },
            {
                network: "unichainSepolia",
                chainId: 1301,
                urls: {
                    apiURL: "https://api-sepolia.uniscan.xyz/api",
                    browserURL: "https://sepolia.uniscan.xyz"
                }
            },
            {
                network: "arbitrumSepolia",
                chainId: 421614,
                urls: {
                    apiURL: "https://api-sepolia.arbiscan.io/api",
                    browserURL: "https://sepolia.arbiscan.io"
                }
            }
        ]
    }
};

export default config;
