import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, TrendingUp, DollarSign, Wallet, ArrowDownRight, Activity } from "lucide-react";
import { DepositModal } from "@/components/deposit-modal";
import { transactions, chartData, plans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, John. Your portfolio is growing.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Activity className="w-4 h-4" />
            <span>Network Status: Optimal</span>
          </div>
        </div>

        {/* Hero Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card - Takes up 2 columns on desktop */}
          <Card className="md:col-span-2 glass-panel border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl md:text-5xl font-display font-bold text-white">$12,450.80</span>
                <span className="text-primary font-medium flex items-center bg-primary/10 px-2 py-1 rounded-lg text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +12.5%
                </span>
              </div>
              
              <div className="h-[180px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Yield Card */}
          <div className="space-y-6">
            <Card className="glass-panel border-white/5 h-full flex flex-col justify-center p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-muted-foreground font-medium text-sm uppercase">Quick Deposit</h3>
                <p className="text-2xl font-display font-bold text-white">Start Earning</p>
                <p className="text-sm text-muted-foreground">Automated bridge & stake via PIX</p>
              </div>
              <DepositModal />
            </Card>
          </div>
        </div>

        {/* Investment Plans Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Yield Opportunities</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative p-6 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                  plan.recommended 
                    ? "bg-gradient-to-br from-card to-card/50 border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                    : "bg-card/40 border-white/5 hover:border-white/10"
                )}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                    RECOMMENDED
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Duration</span>
                    <h3 className="text-2xl font-bold font-display">{plan.duration}</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-primary">{plan.apy}</span>
                    <span className="text-sm text-muted-foreground mb-1">APY</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Min. Invest</span>
                    <span>${plan.min}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold">Recent Activity</h2>
          <Card className="glass-panel border-white/5">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        tx.type === 'deposit' 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "bg-accent/10 border-accent/20 text-accent"
                      )}>
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{tx.protocol}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-white">{tx.converted || tx.amount}</p>
                      <p className="text-xs text-muted-foreground">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </Layout>
  );
}
