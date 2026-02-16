import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { plans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Shield, Info, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvestmentsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Investment Plans</h1>
          <p className="text-muted-foreground">Choose the best yield strategy for your goals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden group hover:shadow-2xl",
                plan.recommended 
                  ? "bg-gradient-to-br from-card to-primary/5 border-primary/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-105 z-10" 
                  : "bg-card/40 border-white/5 hover:border-white/10 hover:bg-card/60"
              )}
            >
              {plan.recommended && (
                <div className="bg-primary py-2 text-center text-primary-foreground text-sm font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
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
                  <li className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-muted-foreground">Automated compounding daily</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-muted-foreground">No gas fees for deposits</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-muted-foreground">Instant withdrawal (with 2% fee)</span>
                  </li>
                </ul>

                <Button 
                  className={cn(
                    "w-full h-14 text-lg font-bold rounded-xl transition-all",
                    plan.recommended 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  )}
                >
                  Start Investing
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active Investments Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-display font-bold mb-6">Your Active Positions</h2>
          <Card className="glass-panel border-white/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-white/5 bg-white/5 font-medium text-sm text-muted-foreground">
              <div>Asset / Protocol</div>
              <div>Amount Staked</div>
              <div>Current Value</div>
              <div>APY / Yield</div>
            </div>
            <div className="divide-y divide-white/5">
              {[1, 2].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 hover:bg-white/5 transition-colors items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                      A
                    </div>
                    <div>
                      <p className="font-bold text-white">Aave V3</p>
                      <p className="text-xs text-muted-foreground">Optimism Network</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-white">$5,000.00</p>
                    <p className="text-xs text-muted-foreground">Initial Deposit</p>
                  </div>
                  <div>
                    <p className="font-mono text-primary font-bold">$5,240.50</p>
                    <p className="text-xs text-green-500 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +$240.50
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                      12.5% APY
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
