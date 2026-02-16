import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  stripeCustomerId: text("stripe_customer_id"),
  walletAddress: text("wallet_address"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amountBrl: numeric("amount_brl"),
  amountUsd: numeric("amount_usd"),
  status: text("status").notNull().default("pending"),
  protocol: text("protocol"),
  details: text("details"),
  stage: integer("stage").default(0),
  mintTxHash: text("mint_tx_hash"),
  bridgeTxHash: text("bridge_tx_hash"),
  stakeTxHash: text("stake_tx_hash"),
  unstakeTxHash: text("unstake_tx_hash"),
  chainId: integer("chain_id"),
  explorerBaseUrl: text("explorer_base_url"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull(),
  amountUsd: numeric("amount_usd").notNull(),
  currentValue: numeric("current_value").notNull(),
  apy: numeric("apy").notNull(),
  protocol: text("protocol").notNull(),
  network: text("network").notNull(),
  active: boolean("active").default(true),
  stakeTxHash: text("stake_tx_hash"),
  unstakeTxHash: text("unstake_tx_hash"),
  tokenAddress: text("token_address"),
  aavePositionId: text("aave_position_id"),
  chainId: integer("chain_id"),
  startedAt: timestamp("started_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  startedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;
