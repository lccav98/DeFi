import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertInvestmentSchema } from "@shared/schema";
import { z } from "zod";

const EXCHANGE_RATE = 5.0; // BRL to USD

const PLANS = [
  { id: "plan-3", duration: "3 Months", apy: 8.5, risk: "Low", min: 50 },
  { id: "plan-6", duration: "6 Months", apy: 12.5, risk: "Medium", min: 100, recommended: true },
  { id: "plan-12", duration: "12 Months", apy: 18.2, risk: "Medium-High", min: 500 },
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============ AUTH ============
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

  // ============ PLANS ============
  app.get("/api/plans", async (_req, res) => {
    return res.json(PLANS);
  });

  // ============ DASHBOARD ============
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.params.userId);
      return res.json(stats);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  // ============ TRANSACTIONS ============
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

  // Simulate the automated DeFi processing pipeline
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

      // Advance to next stage
      const currentStage = tx.stage || 0;
      const nextStage = stages[currentStage];
      if (!nextStage) {
        return res.json({ ...tx, completed: true });
      }

      const updated = await storage.updateTransactionStatus(tx.id, nextStage.status, nextStage.stage);
      
      // If completed, create the investment
      if (nextStage.status === "completed" && tx.amountUsd) {
        await storage.createInvestment({
          userId: tx.userId,
          planId: "plan-6",
          amountUsd: tx.amountUsd,
          currentValue: tx.amountUsd,
          apy: "12.5",
          protocol: "Aave V3",
          network: "Optimism",
          active: true,
        });
      }

      return res.json({ ...updated, completed: nextStage.status === "completed" });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  // ============ INVESTMENTS ============
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

  // ============ WITHDRAW FLOW ============
  const withdrawSchema = z.object({
    userId: z.string().min(1),
    investmentId: z.string().min(1),
    pixKey: z.string().optional(),
  });

  app.post("/api/withdraw", async (req, res) => {
    try {
      const { userId, investmentId, pixKey: userPixKey } = withdrawSchema.parse(req.body);

      const investment = await storage.getInvestment(investmentId);
      if (!investment || investment.userId !== userId) {
        return res.status(404).json({ message: "Investment not found" });
      }
      if (!investment.active) {
        return res.status(400).json({ message: "Investment is already withdrawn" });
      }

      const withdrawalFee = 0.02;
      const currentValueUsd = parseFloat(investment.currentValue);
      const feeUsd = currentValueUsd * withdrawalFee;
      const netUsd = currentValueUsd - feeUsd;
      const netBrl = (netUsd * EXCHANGE_RATE).toFixed(2);

      const result = await storage.withdrawInvestment(investmentId, {
        userId,
        type: "withdrawal",
        amountBrl: netBrl,
        amountUsd: netUsd.toFixed(2),
        status: "completed",
        protocol: investment.protocol,
        details: `Unstake → Bridge → DPIX → PIX (fee: $${feeUsd.toFixed(2)})${userPixKey ? ` → ${userPixKey}` : ""}`,
        stage: 4,
      });

      return res.json({
        transaction: result.transaction,
        summary: {
          grossUsd: currentValueUsd.toFixed(2),
          feeUsd: feeUsd.toFixed(2),
          feePercent: (withdrawalFee * 100).toFixed(0),
          netUsd: netUsd.toFixed(2),
          netBrl,
        },
      });
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: e.errors });
      }
      return res.status(500).json({ message: e.message });
    }
  });

  // ============ DEPOSIT FLOW (PIX) ============
  app.post("/api/deposit", async (req, res) => {
    try {
      const { userId, amountBrl } = req.body;
      if (!userId || !amountBrl || parseFloat(amountBrl) < 50) {
        return res.status(400).json({ message: "Invalid deposit. Minimum R$ 50.00" });
      }

      const amountUsd = (parseFloat(amountBrl) / EXCHANGE_RATE).toFixed(2);

      const tx = await storage.createTransaction({
        userId,
        type: "deposit",
        amountBrl: amountBrl.toString(),
        amountUsd,
        status: "pending",
        protocol: "Aave V3",
        details: "PIX → DPIX → USDT (Liquid) → USDT (Optimism) → Stake",
        stage: 0,
      });

      const pixKey = `00020126580014br.gov.bcb.pix0136${tx.id.slice(0, 36)}5204000053039865802BR5913DEFI DIRECT6008SAO PAULO62070503***6304`;

      return res.status(201).json({ transaction: tx, pixKey });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}
