import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, TrendingUp, DollarSign, ArrowDownRight, Activity, Loader2 } from "lucide-react";
import { DepositModal } from "@/components/deposit-modal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Transaction, Investment } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalPortfolioValue: number;
    totalDeposited: number;
    totalYield: number;
    activeInvestments: number;
  }>({
    queryKey: ["/api/dashboard", user?.id],
    enabled: !!user,
  });

  const { data: txs = [], isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    enabled: !!user,
  });

  const PLANS = [
    { id: "plan-3", duration: t("plans.months3"), apy: "8.5%", risk: t("plans.low"), min: 50 },
    { id: "plan-6", duration: t("plans.months6"), apy: "12.5%", risk: t("plans.medium"), min: 100, recommended: true },
    { id: "plan-12", duration: t("plans.months12"), apy: "18.2%", risk: t("plans.mediumHigh"), min: 500 },
  ];

  const chartData = [
    { name: "Jan", value: stats?.totalPortfolioValue ? stats.totalPortfolioValue * 0.6 : 0 },
    { name: "Feb", value: stats?.totalPortfolioValue ? stats.totalPortfolioValue * 0.7 : 0 },
    { name: "Mar", value: stats?.totalPortfolioValue ? stats.totalPortfolioValue * 0.78 : 0 },
    { name: "Apr", value: stats?.totalPortfolioValue ? stats.totalPortfolioValue * 0.85 : 0 },
    { name: "May", value: stats?.totalPortfolioValue ? stats.totalPortfolioValue * 0.93 : 0 },
    { name: "Jun", value: stats?.totalPortfolioValue || 0 },
  ];

  const portfolioValue = stats?.totalPortfolioValue?.toFixed(2) || "0.00";
  const yieldPercent = stats && stats.totalDeposited > 0 
    ? ((stats.totalYield / stats.totalDeposited) * 100).toFixed(1) 
    : "0.0";

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-dashboard-title">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">{t("dashboard.welcomeBack", { name: user?.displayName || user?.username || "" })}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Activity className="w-4 h-4" />
            <span>{t("dashboard.networkStatus")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 glass-panel border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-muted-foreground font-medium text-sm uppercase tracking-wider">{t("dashboard.totalPortfolio")}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {statsLoading ? (
                <div className="flex items-center gap-2 py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /><span className="text-muted-foreground">{t("dashboard.loading")}</span></div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl md:text-5xl font-display font-bold text-white" data-testid="text-portfolio-value">${portfolioValue}</span>
                    {parseFloat(yieldPercent) > 0 && (
                      <span className="text-primary font-medium flex items-center bg-primary/10 px-2 py-1 rounded-lg text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        +{yieldPercent}%
                      </span>
                    )}
                  </div>
                  <div className="h-[180px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 11%)', borderColor: 'hsl(217, 33%, 20%)', borderRadius: '8px' }} itemStyle={{ color: 'hsl(160, 84%, 39%)' }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-panel border-white/5 h-full flex flex-col justify-center p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-muted-foreground font-medium text-sm uppercase">{t("dashboard.quickDeposit")}</h3>
                <p className="text-2xl font-display font-bold text-white">{t("dashboard.startEarning")}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.automatedBridge")}</p>
              </div>
              <DepositModal />
            </Card>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">{t("dashboard.yieldOpportunities")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <motion.div key={plan.id} whileHover={{ y: -5 }} className={cn("relative p-6 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden", plan.recommended ? "bg-gradient-to-br from-card to-card/50 border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-card/40 border-white/5 hover:border-white/10")}>
                {plan.recommended && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">{t("dashboard.recommended")}</div>}
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground text-sm">{t("dashboard.duration")}</span>
                    <h3 className="text-2xl font-bold font-display">{plan.duration}</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-primary">{plan.apy}</span>
                    <span className="text-sm text-muted-foreground mb-1">APY</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("dashboard.minInvest")}</span>
                    <span>${plan.min}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold">{t("dashboard.recentActivity")}</h2>
          <Card className="glass-panel border-white/5">
            <CardContent className="p-0">
              {txLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : txs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">{t("dashboard.noTransactions")}</p>
                  <p className="text-sm">{t("dashboard.firstDeposit")}</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {txs.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors" data-testid={`row-transaction-${tx.id}`}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", tx.type === 'deposit' ? "bg-primary/10 border-primary/20 text-primary" : "bg-accent/10 border-accent/20 text-accent")}>
                          {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{tx.protocol || "DeFi Protocol"}</p>
                          <p className="text-xs text-muted-foreground">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${tx.amountUsd} USDT</p>
                        <p className="text-xs text-muted-foreground capitalize">{t(`common.status.${tx.status}`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
