import { ethers } from "ethers";
import { getNetworkConfig, type NetworkConfig } from "./config";

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    const config = getNetworkConfig();
    provider = new ethers.JsonRpcProvider(config.rpcUrl, {
      name: config.name,
      chainId: config.chainId,
    });
  }
  return provider;
}

export function getSigner(): ethers.Wallet {
  if (!signer) {
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PLATFORM_WALLET_PRIVATE_KEY not configured. Cannot sign transactions.");
    }
    signer = new ethers.Wallet(privateKey, getProvider());
  }
  return signer;
}

export function getPlatformWalletAddress(): string {
  try {
    return getSigner().address;
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
}

export async function getWalletBalance(): Promise<string> {
  try {
    const wallet = getSigner();
    const balance = await getProvider().getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch {
    return "0";
  }
}

export async function waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
  const prov = getProvider();
  return await prov.waitForTransaction(txHash, confirmations, 120000);
}

export function isBlockchainConfigured(): boolean {
  return !!process.env.PLATFORM_WALLET_PRIVATE_KEY;
}

export function resetProvider(): void {
  provider = null;
  signer = null;
}
