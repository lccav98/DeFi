export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerBaseUrl: string;
  contracts: {
    usdt: string;
    aavePool: string;
    aUsdt: string;
    dpixToken: string;
  };
  isTestnet: boolean;
}

export const OPTIMISM_MAINNET: NetworkConfig = {
  name: "Optimism",
  chainId: 10,
  rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  explorerBaseUrl: "https://optimistic.etherscan.io",
  contracts: {
    usdt: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    aavePool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    aUsdt: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
    dpixToken: "0x0000000000000000000000000000000000000000",
  },
  isTestnet: false,
};

export const OPTIMISM_SEPOLIA: NetworkConfig = {
  name: "Optimism Sepolia",
  chainId: 11155420,
  rpcUrl: process.env.OPTIMISM_RPC_URL || "https://sepolia.optimism.io",
  explorerBaseUrl: "https://sepolia-optimism.etherscan.io",
  contracts: {
    usdt: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
    aavePool: "0xb50201558B00496A145fE76f7424749556E326D8",
    aUsdt: "0x0000000000000000000000000000000000000000",
    dpixToken: "0x0000000000000000000000000000000000000000",
  },
  isTestnet: true,
};

export function getNetworkConfig(): NetworkConfig {
  const useTestnet = process.env.BLOCKCHAIN_NETWORK !== "mainnet";
  return useTestnet ? OPTIMISM_SEPOLIA : OPTIMISM_MAINNET;
}

export function getExplorerTxUrl(txHash: string, explorerBaseUrl?: string): string {
  const baseUrl = explorerBaseUrl || getNetworkConfig().explorerBaseUrl;
  return `${baseUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string, explorerBaseUrl?: string): string {
  const baseUrl = explorerBaseUrl || getNetworkConfig().explorerBaseUrl;
  return `${baseUrl}/address/${address}`;
}
