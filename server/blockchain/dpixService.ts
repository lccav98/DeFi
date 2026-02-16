import { ethers } from "ethers";
import { getSigner, waitForTransaction } from "./provider";
import { getNetworkConfig } from "./config";
import { ERC20_ABI } from "./abis";

export interface DpixMintResult {
  txHash: string;
  amount: string;
  recipient: string;
  tokenAddress: string;
}

export interface DpixBurnResult {
  txHash: string;
  amount: string;
  from: string;
}

export async function mintDpix(amount: string, pixTransactionId: string): Promise<DpixMintResult> {
  const config = getNetworkConfig();
  const wallet = getSigner();

  if (config.contracts.dpixToken === "0x0000000000000000000000000000000000000000") {
    const usdtContract = new ethers.Contract(config.contracts.usdt, ERC20_ABI, wallet);
    const decimals = await usdtContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: BigInt(0),
      data: ethers.solidityPacked(
        ["string", "string", "uint256"],
        ["DPIX_MINT:", pixTransactionId, amountWei]
      ),
    });

    const receipt = await waitForTransaction(tx.hash);
    if (!receipt || receipt.status !== 1) {
      throw new Error(`DPIX mint receipt failed. TX: ${tx.hash}`);
    }

    console.log(`[blockchain] DPIX mint recorded on-chain. Amount: ${amount} USDT, PIX ID: ${pixTransactionId}, TX: ${tx.hash}`);

    return {
      txHash: tx.hash,
      amount,
      recipient: wallet.address,
      tokenAddress: config.contracts.usdt,
    };
  }

  const dpixContract = new ethers.Contract(config.contracts.dpixToken, [
    ...ERC20_ABI,
    "function mint(address to, uint256 amount)",
  ], wallet);

  const decimals = await dpixContract.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);

  const tx = await dpixContract.mint(wallet.address, amountWei);
  const receipt = await waitForTransaction(tx.hash);
  if (!receipt || receipt.status !== 1) {
    throw new Error(`DPIX mint failed. TX: ${tx.hash}`);
  }

  console.log(`[blockchain] DPIX minted: ${amount}, TX: ${tx.hash}`);

  return {
    txHash: tx.hash,
    amount,
    recipient: wallet.address,
    tokenAddress: config.contracts.dpixToken,
  };
}

export async function recordBridge(amount: string, sourceNetwork: string, destNetwork: string): Promise<string> {
  const wallet = getSigner();

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: BigInt(0),
    data: ethers.solidityPacked(
      ["string", "string", "string", "string"],
      ["DPIX_BRIDGE:", amount, sourceNetwork, destNetwork]
    ),
  });

  const receipt = await waitForTransaction(tx.hash);
  if (!receipt || receipt.status !== 1) {
    throw new Error(`Bridge record failed. TX: ${tx.hash}`);
  }

  console.log(`[blockchain] Bridge recorded: ${amount} USDT from ${sourceNetwork} to ${destNetwork}. TX: ${tx.hash}`);
  return tx.hash;
}
