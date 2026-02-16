import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertInvestmentSchema } from "@shared/schema";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { getNetworkConfig, getExplorerTxUrl } from "./blockchain/config";
import { isBlockchainConfigured, getPlatformWalletAddress, getWalletBalance } from "./blockchain/provider";
import { executeDepositPipeline, executeWithdrawPipeline } from "./blockchain/pipeline";
import { getAavePosition, getUsdtBalance } from "./blockchain/aaveService";

const EXCHANGE_RATE = 5.0;
const PLATFORM_FEE_PERCENT = 1.5;

const PLANS = [
  { id: "plan-3", duration: "3 Months", apy: 8.5, risk: "Low", min: 50 },
  { id: "plan-6", duration: "6 Months", apy: 12.5, risk: "Medium", min: 100, recommended: true },
  { id: "plan-12", duration: "12 Months", apy: 18.2, risk: "Medium-High", min: 500 },
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const body = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(body.username);
      if (existing) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(body);
      return res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName });
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: e.errors });
      }
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return res.json({ id: user.id, username: user.username, displayName: user.displayName });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/plans", async (_req, res) => {
    return res.json(PLANS);
  });

  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.params.userId);
      return res.json(stats);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const txs = await storage.getTransactionsByUser(req.params.userId);
      return res.json(txs);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const body = insertTransactionSchema.parse(req.body);
      const tx = await storage.createTransaction(body);
      return res.status(201).json(tx);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: e.errors });
      }
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/transactions/:id/process", async (req, res) => {
    try {
      const tx = await storage.getTransaction(req.params.id);
      if (!tx) return res.status(404).json({ message: "Transaction not found" });

      const stages = [
        { status: "processing", stage: 1 },
        { status: "processing", stage: 2 },
        { status: "processing", stage: 3 },
        { status: "completed", stage: 4 },
      ];

      const currentStage = tx.stage || 0;
      const nextStage = stages[currentStage];
      if (!nextStage) {
        return res.json({ ...tx, completed: true });
      }

      const config = getNetworkConfig();
      const updated = await storage.updateTransactionStage(tx.id, nextStage.stage, nextStage.status, {
        chainId: config.chainId,
        explorerBaseUrl: config.explorerBaseUrl,
      });

      if (nextStage.status === "completed" && tx.amountUsd) {
        await storage.createInvestment({
          userId: tx.userId,
          planId: "plan-6",
          amountUsd: tx.amountUsd,
          currentValue: tx.amountUsd,
          apy: "12.5",
          protocol: "Aave V3",
          network: config.name,
          active: true,
          chainId: config.chainId,
        });
      }

      return res.json({ ...updated, completed: nextStage.status === "completed" });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/deposit/:id/execute-pipeline", async (req, res) => {
    try {
      const tx = await storage.getTransaction(req.params.id);
      if (!tx) return res.status(404).json({ message: "Transaction not found" });
      if (!tx.amountUsd) return res.status(400).json({ message: "Transaction has no USD amount" });

      executeDepositPipeline(tx.id, tx.amountUsd, tx.userId).catch((err) => {
        console.error(`[pipeline] Background pipeline failed for tx ${tx.id}:`, err);
      });

      return res.json({
        message: "Pipeline started",
        transactionId: tx.id,
        blockchain: isBlockchainConfigured() ? "real" : "simulated",
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/transactions/:id/status", async (req, res) => {
    try {
      const tx = await storage.getTransaction(req.params.id);
      if (!tx) return res.status(404).json({ message: "Transaction not found" });

      const config = getNetworkConfig();
      const explorerBase = tx.explorerBaseUrl || config.explorerBaseUrl;

      return res.json({
        id: tx.id,
        stage: tx.stage,
        status: tx.status,
        mintTxHash: tx.mintTxHash,
        bridgeTxHash: tx.bridgeTxHash,
        stakeTxHash: tx.stakeTxHash,
        unstakeTxHash: tx.unstakeTxHash,
        chainId: tx.chainId,
        explorerBaseUrl: explorerBase,
        txLinks: {
          mint: tx.mintTxHash ? getExplorerTxUrl(tx.mintTxHash, explorerBase) : null,
          bridge: tx.bridgeTxHash ? getExplorerTxUrl(tx.bridgeTxHash, explorerBase) : null,
          stake: tx.stakeTxHash ? getExplorerTxUrl(tx.stakeTxHash, explorerBase) : null,
          unstake: tx.unstakeTxHash ? getExplorerTxUrl(tx.unstakeTxHash, explorerBase) : null,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/investments/:userId", async (req, res) => {
    try {
      const invs = await storage.getInvestmentsByUser(req.params.userId);
      return res.json(invs);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const body = insertInvestmentSchema.parse(req.body);
      const inv = await storage.createInvestment(body);
      return res.status(201).json(inv);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: e.errors });
      }
      return res.status(500).json({ message: e.message });
    }
  });

  const withdrawSchema = z.object({
    userId: z.string().min(1),
    investmentId: z.string().min(1),
    pixKey: z.string().optional(),
  });

  app.post("/api/withdraw", async (req, res) => {
    try {
      const { userId, investmentId, pixKey: userPixKey } = withdrawSchema.parse(req.body);

      const result = await executeWithdrawPipeline(investmentId, "", userId, userPixKey);

      return res.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: e.errors });
      }
      return res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/stripe/config", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      return res.json({ publishableKey });
    } catch (e: any) {
      return res.status(500).json({ message: "Stripe not configured" });
    }
  });

  app.post("/api/stripe/create-fee-payment", async (req, res) => {
    try {
      const { userId, amountBrl } = req.body;
      if (!userId || !amountBrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId, username: user.username },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }

      const amountUsd = parseFloat(amountBrl) / EXCHANGE_RATE;
      const feeUsd = amountUsd * (PLATFORM_FEE_PERCENT / 100);
      const feeInCents = Math.round(feeUsd * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.max(feeInCents, 50),
        currency: "usd",
        customer: customerId,
        metadata: {
          userId,
          depositAmountBrl: amountBrl,
          depositAmountUsd: amountUsd.toFixed(2),
          feePercent: PLATFORM_FEE_PERCENT.toString(),
          type: "platform_fee",
        },
        automatic_payment_methods: { enabled: true },
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        feeUsd: feeUsd.toFixed(2),
        feePercent: PLATFORM_FEE_PERCENT,
        netAmountUsd: (amountUsd - feeUsd).toFixed(2),
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/deposit/pix", async (req, res) => {
    try {
      const { userId, amountBrl } = req.body;
      if (!userId || !amountBrl || parseFloat(amountBrl) < 50) {
        return res.status(400).json({ message: "Invalid deposit. Minimum R$ 50.00" });
      }

      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId, username: user.username },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }

      const amountCentavos = Math.round(parseFloat(amountBrl) * 100);
      const config = getNetworkConfig();
      const grossUsd = parseFloat(amountBrl) / EXCHANGE_RATE;
      const feeUsd = grossUsd * (PLATFORM_FEE_PERCENT / 100);
      const netUsd = (grossUsd - feeUsd).toFixed(2);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCentavos,
        currency: "brl",
        payment_method_types: ["pix"],
        customer: customerId,
        metadata: {
          userId,
          amountBrl: amountBrl.toString(),
          netUsd,
          feeUsd: feeUsd.toFixed(2),
          type: "pix_deposit",
        },
      });

      const tx = await storage.createTransaction({
        userId,
        type: "deposit",
        amountBrl: amountBrl.toString(),
        amountUsd: netUsd,
        status: "awaiting_payment",
        protocol: "Aave V3",
        details: `PIX → DPIX → USDT → Stake (fee: ${PLATFORM_FEE_PERCENT}% = $${feeUsd.toFixed(2)})`,
        stage: 0,
        chainId: config.chainId,
        explorerBaseUrl: config.explorerBaseUrl,
        stripePaymentIntentId: paymentIntent.id,
      });

      return res.status(201).json({
        transaction: tx,
        clientSecret: paymentIntent.client_secret,
        fee: {
          percent: PLATFORM_FEE_PERCENT,
          amountUsd: feeUsd.toFixed(2),
          netUsd,
        },
      });
    } catch (e: any) {
      console.error("[pix] Error creating PIX payment:", e);
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/deposit/pix/:id/confirm", async (req, res) => {
    try {
      const tx = await storage.getTransaction(req.params.id);
      if (!tx) return res.status(404).json({ message: "Transaction not found" });

      if (tx.status === "completed" || tx.status === "processing") {
        return res.json({ status: tx.status, transactionId: tx.id });
      }

      await storage.updateTransactionStatus(tx.id, "processing", 0);

      executeDepositPipeline(tx.id, tx.amountUsd!, tx.userId).catch((err) => {
        console.error(`[pipeline] PIX pipeline failed for tx ${tx.id}:`, err);
      });

      return res.json({
        message: "Payment confirmed, pipeline started",
        transactionId: tx.id,
        blockchain: isBlockchainConfigured() ? "real" : "simulated",
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/deposit", async (req, res) => {
    try {
      const { userId, amountBrl } = req.body;
      if (!userId || !amountBrl || parseFloat(amountBrl) < 50) {
        return res.status(400).json({ message: "Invalid deposit. Minimum R$ 50.00" });
      }

      const config = getNetworkConfig();
      const grossUsd = parseFloat(amountBrl) / EXCHANGE_RATE;
      const feeUsd = grossUsd * (PLATFORM_FEE_PERCENT / 100);
      const netUsd = (grossUsd - feeUsd).toFixed(2);

      const tx = await storage.createTransaction({
        userId,
        type: "deposit",
        amountBrl: amountBrl.toString(),
        amountUsd: netUsd,
        status: "pending",
        protocol: "Aave V3",
        details: `PIX → DPIX → USDT → Stake (fee: ${PLATFORM_FEE_PERCENT}% = $${feeUsd.toFixed(2)})`,
        stage: 0,
        chainId: config.chainId,
        explorerBaseUrl: config.explorerBaseUrl,
      });

      const pixKey = `00020126580014br.gov.bcb.pix0136${tx.id.slice(0, 36)}5204000053039865802BR5913DEFI DIRECT6008SAO PAULO62070503***6304`;

      return res.status(201).json({
        transaction: tx,
        pixKey,
        fee: {
          percent: PLATFORM_FEE_PERCENT,
          amountUsd: feeUsd.toFixed(2),
          netUsd,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/blockchain/status", async (_req, res) => {
    try {
      const config = getNetworkConfig();
      const configured = isBlockchainConfigured();

      const status: any = {
        configured,
        network: config.name,
        chainId: config.chainId,
        isTestnet: config.isTestnet,
        explorerBaseUrl: config.explorerBaseUrl,
        contracts: config.contracts,
      };

      if (configured) {
        status.platformWallet = getPlatformWalletAddress();
        try {
          status.ethBalance = await getWalletBalance();
          status.usdtBalance = await getUsdtBalance();
          status.aavePosition = await getAavePosition();
        } catch (err: any) {
          status.balanceError = err.message;
        }
      }

      return res.json(status);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}
