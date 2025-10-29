import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify"; 

import dotenv from "dotenv";
dotenv.config();

const PK = process.env.PK || "";

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 1337,
            forking: {
                url: `${process.env.RPC_URL}`
            }
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: PK ? [PK] : [],
            chainId: 11155111
        },
        base: {
			accounts: PK ? [PK] : [],
			chainId: 8453,
			url: "https://mainnet.base.org",
		},
        mainnet: {
            chainId: 1,
            url: `${process.env.RPC_URL}`,
            accounts: PK ? [PK] : []
        },
        amoy: {
            url: "https://api.zan.top/polygon-amoy",
            accounts: PK ? [PK] : [],
            chainId: 80002
        },
        polygon: {
            url: "https://polygon-rpc.com",
            accounts: PK ? [PK] : [],
            chainId: 137
        },
    },
    solidity: "0.8.24",
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    mocha: {
        timeout: 40000
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY || "",
            base: process.env.ETHERSCAN_API_KEY || "",
            mainnet: process.env.ETHERSCAN_API_KEY || "",
            amoy: process.env.ETHERSCAN_API_KEY || "",
            polygon: process.env.ETHERSCAN_API_KEY || "",
        },
        customChains: [
            {
                network: "polygon",
                chainId: 137,
                urls: {
                    apiURL: "https://api.polygonscan.com/api",
                    browserURL: "https://polygonscan.com"
                }
            },
            {
                network: "base",
                chainId: 8453,
                urls: {
                    apiURL: "https://api.basescan.org/api",
                    browserURL: "https://basescan.org"
                }
            },
            {
                network: "amoy",
                chainId: 1422,
                urls: {
                    apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
                    browserURL: "https://testnet-zkevm.polygonscan.com"
                }
            }
        ]
    }
};

export default config;
