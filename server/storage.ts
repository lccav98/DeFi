import { 
  type User, type InsertUser, 
  type Transaction, type InsertTransaction,
  type Investment, type InsertInvestment,
  users, transactions, investments 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string, stage?: number): Promise<Transaction | undefined>;

  getInvestmentsByUser(userId: string): Promise<Investment[]>;
  getInvestment(id: string): Promise<Investment | undefined>;
  createInvestment(inv: InsertInvestment): Promise<Investment>;
  updateInvestmentValue(id: string, currentValue: string): Promise<Investment | undefined>;
  deactivateInvestment(id: string): Promise<Investment | undefined>;
  withdrawInvestment(investmentId: string, txData: InsertTransaction): Promise<{ investment: Investment; transaction: Transaction }>;

  updateUserStripeInfo(userId: string, stripeCustomerId: string): Promise<User | undefined>;

  getDashboardStats(userId: string): Promise<{
    totalPortfolioValue: number;
    totalDeposited: number;
    totalYield: number;
    activeInvestments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx;
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(tx).returning();
    return created;
  }

  async updateTransactionStatus(id: string, status: string, stage?: number): Promise<Transaction | undefined> {
    const updates: any = { status };
    if (stage !== undefined) updates.stage = stage;
    const [updated] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    return await db.select().from(investments)
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.startedAt));
  }

  async getInvestment(id: string): Promise<Investment | undefined> {
    const [inv] = await db.select().from(investments).where(eq(investments.id, id));
    return inv;
  }

  async createInvestment(inv: InsertInvestment): Promise<Investment> {
    const [created] = await db.insert(investments).values(inv).returning();
    return created;
  }

  async updateInvestmentValue(id: string, currentValue: string): Promise<Investment | undefined> {
    const [updated] = await db.update(investments).set({ currentValue }).where(eq(investments.id, id)).returning();
    return updated;
  }

  async deactivateInvestment(id: string): Promise<Investment | undefined> {
    const [updated] = await db.update(investments).set({ active: false }).where(eq(investments.id, id)).returning();
    return updated;
  }

  async withdrawInvestment(investmentId: string, txData: InsertTransaction): Promise<{ investment: Investment; transaction: Transaction }> {
    return await db.transaction(async (tx) => {
      const [updatedInv] = await tx.update(investments).set({ active: false }).where(eq(investments.id, investmentId)).returning();
      if (!updatedInv) throw new Error("Failed to deactivate investment");

      const [createdTx] = await tx.insert(transactions).values(txData).returning();
      if (!createdTx) throw new Error("Failed to create withdrawal transaction");

      return { investment: updatedInv, transaction: createdTx };
    });
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getDashboardStats(userId: string): Promise<{
    totalPortfolioValue: number;
    totalDeposited: number;
    totalYield: number;
    activeInvestments: number;
  }> {
    const userInvestments = await this.getInvestmentsByUser(userId);
    const activeOnes = userInvestments.filter(i => i.active);
    
    const totalDeposited = activeOnes.reduce((sum, i) => sum + parseFloat(i.amountUsd), 0);
    const totalPortfolioValue = activeOnes.reduce((sum, i) => sum + parseFloat(i.currentValue), 0);
    const totalYield = totalPortfolioValue - totalDeposited;

    return {
      totalPortfolioValue,
      totalDeposited,
      totalYield,
      activeInvestments: activeOnes.length,
    };
  }
}

export const storage = new DatabaseStorage();
