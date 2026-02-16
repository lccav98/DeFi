import { storage } from "../storage";
import { getNetworkConfig } from "./config";
import { isBlockchainConfigured, getPlatformWalletAddress } from "./provider";
import { mintDpix, recordBridge } from "./dpixService";
import { supplyToAave, withdrawFromAave } from "./aaveService";

export interface PipelineStageResult {
  stage: number;
  status: "processing" | "completed" | "failed";
  txHash?: string;
  error?: string;
}

export async function executeDepositPipeline(
  transactionId: string,
  amountUsd: string,
  userId: string
): Promise<void> {
  const config = getNetworkConfig();
  const configured = isBlockchainConfigured();

  if (!configured) {
    console.log(`[pipeline] Blockchain not configured. Running simulated pipeline for tx ${transactionId}`);
    await executeSimulatedPipeline(transactionId, amountUsd, userId);
    return;
  }

  console.log(`[pipeline] Starting real deposit pipeline for tx ${transactionId}, amount: $${amountUsd}`);

  try {
    await storage.updateTransactionStage(transactionId, 1, "processing", {});
    const mintResult = await mintDpix(amountUsd, transactionId);
    await storage.updateTransactionStage(transactionId, 1, "processing", {
      mintTxHash: mintResult.txHash,
      chainId: config.chainId,
      explorerBaseUrl: config.explorerBaseUrl,
    });
    console.log(`[pipeline] Stage 1 complete: DPIX minted. TX: ${mintResult.txHash}`);
  } catch (err: any) {
    console.error(`[pipeline] Stage 1 failed:`, err.message);
    await storage.updateTransactionStage(transactionId, 1, "failed", {
      details: `DPIX mint failed: ${err.message}`,
    });
    return;
  }

  try {
    await storage.updateTransactionStage(transactionId, 2, "processing", {});
    const bridgeTxHash = await recordBridge(amountUsd, "Liquid", "Optimism");
    await storage.updateTransactionStage(transactionId, 2, "processing", {
      bridgeTxHash,
    });
    console.log(`[pipeline] Stage 2 complete: Bridge recorded. TX: ${bridgeTxHash}`);
  } catch (err: any) {
    console.error(`[pipeline] Stage 2 failed:`, err.message);
    await storage.updateTransactionStage(transactionId, 2, "failed", {
      details: `Bridge failed: ${err.message}`,
    });
    return;
  }

  try {
    await storage.updateTransactionStage(transactionId, 3, "processing", {});
    const aaveResult = await supplyToAave(amountUsd);
    await storage.updateTransactionStage(transactionId, 4, "completed", {
      stakeTxHash: aaveResult.supplyTxHash,
    });
    console.log(`[pipeline] Stage 3-4 complete: Staked in Aave V3. TX: ${aaveResult.supplyTxHash}`);

    await storage.createInvestment({
      userId,
      planId: "plan-6",
      amountUsd,
      currentValue: amountUsd,
      apy: "12.5",
      protocol: "Aave V3",
      network: config.name,
      active: true,
      stakeTxHash: aaveResult.supplyTxHash,
      tokenAddress: config.contracts.usdt,
      aavePositionId: getPlatformWalletAddress(),
      chainId: config.chainId,
    });

    console.log(`[pipeline] Deposit pipeline completed successfully for tx ${transactionId}`);
  } catch (err: any) {
    console.error(`[pipeline] Stage 3-4 failed:`, err.message);
    await storage.updateTransactionStage(transactionId, 3, "failed", {
      details: `Aave stake failed: ${err.message}`,
    });
  }
}

export async function executeWithdrawPipeline(
  investmentId: string,
  amountUsd: string,
  userId: string,
  pixKey?: string
): Promise<{ transaction: any; summary: any }> {
  const config = getNetworkConfig();
  const configured = isBlockchainConfigured();
  const WITHDRAWAL_FEE = 0.02;
  const EXCHANGE_RATE = 5.0;

  const investment = await storage.getInvestment(investmentId);
  if (!investment || investment.userId !== userId) {
    throw new Error("Investment not found");
  }
  if (!investment.active) {
    throw new Error("Investment is already withdrawn");
  }

  const currentValueUsd = parseFloat(investment.currentValue);
  const feeUsd = currentValueUsd * WITHDRAWAL_FEE;
  const netUsd = currentValueUsd - feeUsd;
  const netBrl = (netUsd * EXCHANGE_RATE).toFixed(2);

  let unstakeTxHash: string | undefined;

  if (configured) {
    try {
      const withdrawResult = await withdrawFromAave(currentValueUsd.toFixed(6));
      unstakeTxHash = withdrawResult.withdrawTxHash;
      console.log(`[pipeline] Withdrawal from Aave completed. TX: ${unstakeTxHash}`);
    } catch (err: any) {
      console.error(`[pipeline] Aave withdrawal failed:`, err.message);
      throw new Error(`Blockchain withdrawal failed: ${err.message}`);
    }
  }

  const result = await storage.withdrawInvestment(investmentId, {
    userId,
    type: "withdrawal",
    amountBrl: netBrl,
    amountUsd: netUsd.toFixed(2),
    status: "completed",
    protocol: investment.protocol,
    details: `Unstake → Bridge → DPIX → PIX (fee: $${feeUsd.toFixed(2)})${pixKey ? ` → ${pixKey}` : ""}`,
    stage: 4,
    unstakeTxHash,
    chainId: config.chainId,
    explorerBaseUrl: config.explorerBaseUrl,
  });

  if (unstakeTxHash) {
    await storage.updateInvestmentUnstake(investmentId, unstakeTxHash);
  }

  return {
    transaction: result.transaction,
    summary: {
      grossUsd: currentValueUsd.toFixed(2),
      feeUsd: feeUsd.toFixed(2),
      feePercent: (WITHDRAWAL_FEE * 100).toFixed(0),
      netUsd: netUsd.toFixed(2),
      netBrl,
      unstakeTxHash,
      explorerBaseUrl: config.explorerBaseUrl,
    },
  };
}

async function executeSimulatedPipeline(
  transactionId: string,
  amountUsd: string,
  userId: string
): Promise<void> {
  const config = getNetworkConfig();
  const stages = [
    { stage: 1, delay: 2000 },
    { stage: 2, delay: 2500 },
    { stage: 3, delay: 2000 },
    { stage: 4, delay: 1500 },
  ];

  for (const { stage, delay } of stages) {
    await new Promise((r) => setTimeout(r, delay));
    const isLast = stage === 4;
    await storage.updateTransactionStage(
      transactionId,
      stage,
      isLast ? "completed" : "processing",
      {
        chainId: config.chainId,
        explorerBaseUrl: config.explorerBaseUrl,
      }
    );
  }

  await storage.createInvestment({
    userId,
    planId: "plan-6",
    amountUsd,
    currentValue: amountUsd,
    apy: "12.5",
    protocol: "Aave V3",
    network: config.name,
    active: true,
    chainId: config.chainId,
  });
}
