import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Shield, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Investment } from "@shared/schema";

const PLANS = [
  { id: "plan-3", duration: "3 Months", apy: "8.5%", risk: "Low", min: 50 },
  { id: "plan-6", duration: "6 Months", apy: "12.5%", risk: "Medium", min: 100, recommended: true },
  { id: "plan-12", duration: "12 Months", apy: "18.2%", risk: "Medium-High", min: 500 },
];

export default function InvestmentsPage() {
  const { user } = useAuth();

  const { data: investments = [], isLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments", user?.id],
    enabled: !!user,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Investment Plans</h1>
          <p className="text-muted-foreground">Choose the best yield strategy for your goals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className={cn("relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden group hover:shadow-2xl", plan.recommended ? "bg-gradient-to-br from-card to-primary/5 border-primary/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-105 z-10" : "bg-card/40 border-white/5 hover:border-white/10 hover:bg-card/60")}>
              {plan.recommended && <div className="bg-primary py-2 text-center text-primary-foreground text-sm font-bold uppercase tracking-wider">Most Popular</div>}
              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-medium">{plan.duration} Lock</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-5xl font-display font-bold text-white">{plan.apy}</span>
                    <span className="text-xl text-primary font-medium">APY</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Risk Level: <span className="text-white font-medium">{plan.risk}</span>
                  </p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm"><div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary"><Check className="w-3 h-3" /></div><span className="text-muted-foreground">Automated compounding daily</span></li>
                  <li className="flex items-start gap-3 text-sm"><div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary"><Check className="w-3 h-3" /></div><span className="text-muted-foreground">No gas fees for deposits</span></li>
                  <li className="flex items-start gap-3 text-sm"><div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary"><Check className="w-3 h-3" /></div><span className="text-muted-foreground">Instant withdrawal (with 2% fee)</span></li>
                </ul>
                <Button className={cn("w-full h-14 text-lg font-bold rounded-xl transition-all cursor-pointer", plan.recommended ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/5 hover:bg-white/10 text-white border border-white/10")}>
                  Start Investing
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-display font-bold mb-6">Your Active Positions</h2>
          <Card className="glass-panel border-white/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-white/5 bg-white/5 font-medium text-sm text-muted-foreground">
              <div>Asset / Protocol</div>
              <div>Amount Staked</div>
              <div>Current Value</div>
              <div>APY / Yield</div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : investments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No active investments</p>
                <p className="text-sm">Deposit via PIX to start earning yield.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {investments.filter(i => i.active).map((inv) => {
                  const gain = parseFloat(inv.currentValue) - parseFloat(inv.amountUsd);
                  return (
                    <div key={inv.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 hover:bg-white/5 transition-colors items-center" data-testid={`row-investment-${inv.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">A</div>
                        <div>
                          <p className="font-bold text-white">{inv.protocol}</p>
                          <p className="text-xs text-muted-foreground">{inv.network} Network</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-mono text-white">${parseFloat(inv.amountUsd).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Initial Deposit</p>
                      </div>
                      <div>
                        <p className="font-mono text-primary font-bold">${parseFloat(inv.currentValue).toFixed(2)}</p>
                        {gain > 0 && <p className="text-xs text-green-500 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" />+${gain.toFixed(2)}</p>}
                      </div>
                      <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                          {inv.apy}% APY
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>
      </div>
    </Layout>
  );
}
