import { ethers } from "ethers";
import { getSigner, getProvider, waitForTransaction } from "./provider";
import { getNetworkConfig } from "./config";
import { ERC20_ABI, AAVE_POOL_ABI } from "./abis";

export interface AaveSupplyResult {
  approveTxHash: string;
  supplyTxHash: string;
  amount: string;
  asset: string;
  pool: string;
}

export interface AaveWithdrawResult {
  withdrawTxHash: string;
  amount: string;
  asset: string;
}

export async function getUsdtBalance(address?: string): Promise<string> {
  const config = getNetworkConfig();
  const provider = getProvider();
  const usdt = new ethers.Contract(config.contracts.usdt, ERC20_ABI, provider);
  const decimals = await usdt.decimals();
  const balance = await usdt.balanceOf(address || getSigner().address);
  return ethers.formatUnits(balance, decimals);
}

export async function approveUsdtForAave(amount: string): Promise<string> {
  const config = getNetworkConfig();
  const wallet = getSigner();
  const usdt = new ethers.Contract(config.contracts.usdt, ERC20_ABI, wallet);
  const decimals = await usdt.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);

  const currentAllowance = await usdt.allowance(wallet.address, config.contracts.aavePool);
  if (currentAllowance >= amountWei) {
    return "already_approved";
  }

  const tx = await usdt.approve(config.contracts.aavePool, amountWei);
  const receipt = await waitForTransaction(tx.hash);
  if (!receipt || receipt.status !== 1) {
    throw new Error(`USDT approval failed. TX: ${tx.hash}`);
  }

  console.log(`[blockchain] USDT approved for Aave Pool. TX: ${tx.hash}`);
  return tx.hash;
}

export async function supplyToAave(amount: string): Promise<AaveSupplyResult> {
  const config = getNetworkConfig();
  const wallet = getSigner();

  const approveTxHash = await approveUsdtForAave(amount);

  const pool = new ethers.Contract(config.contracts.aavePool, AAVE_POOL_ABI, wallet);
  const usdt = new ethers.Contract(config.contracts.usdt, ERC20_ABI, wallet);
  const decimals = await usdt.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);

  const tx = await pool.supply(
    config.contracts.usdt,
    amountWei,
    wallet.address,
    0
  );

  const receipt = await waitForTransaction(tx.hash);
  if (!receipt || receipt.status !== 1) {
    throw new Error(`Aave supply failed. TX: ${tx.hash}`);
  }

  console.log(`[blockchain] Supplied ${amount} USDT to Aave V3. TX: ${tx.hash}`);

  return {
    approveTxHash: approveTxHash === "already_approved" ? "" : approveTxHash,
    supplyTxHash: tx.hash,
    amount,
    asset: config.contracts.usdt,
    pool: config.contracts.aavePool,
  };
}

export async function withdrawFromAave(amount: string): Promise<AaveWithdrawResult> {
  const config = getNetworkConfig();
  const wallet = getSigner();

  const pool = new ethers.Contract(config.contracts.aavePool, AAVE_POOL_ABI, wallet);
  const usdt = new ethers.Contract(config.contracts.usdt, ERC20_ABI, wallet);
  const decimals = await usdt.decimals();
  const amountWei = ethers.parseUnits(amount, decimals);

  const tx = await pool.withdraw(
    config.contracts.usdt,
    amountWei,
    wallet.address
  );

  const receipt = await waitForTransaction(tx.hash);
  if (!receipt || receipt.status !== 1) {
    throw new Error(`Aave withdrawal failed. TX: ${tx.hash}`);
  }

  console.log(`[blockchain] Withdrew ${amount} USDT from Aave V3. TX: ${tx.hash}`);

  return {
    withdrawTxHash: tx.hash,
    amount,
    asset: config.contracts.usdt,
  };
}

export async function getAavePosition(): Promise<{
  totalCollateralUsd: string;
  totalDebtUsd: string;
  availableBorrowsUsd: string;
  healthFactor: string;
}> {
  const config = getNetworkConfig();
  const wallet = getSigner();
  const pool = new ethers.Contract(config.contracts.aavePool, AAVE_POOL_ABI, getProvider());

  const data = await pool.getUserAccountData(wallet.address);

  return {
    totalCollateralUsd: ethers.formatUnits(data.totalCollateralBase, 8),
    totalDebtUsd: ethers.formatUnits(data.totalDebtBase, 8),
    availableBorrowsUsd: ethers.formatUnits(data.availableBorrowsBase, 8),
    healthFactor: data.healthFactor > BigInt(0) ? ethers.formatUnits(data.healthFactor, 18) : "∞",
  };
}
