import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";

export default function TransactionsPage() {
  const { user } = useAuth();

  const { data: txs = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    enabled: !!user,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Transactions</h1>
          <p className="text-muted-foreground">View your complete deposit and yield history.</p>
        </div>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : txs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm">Your deposit and yield history will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {txs.map((tx) => (
                  <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/5 transition-colors gap-4" data-testid={`row-transaction-${tx.id}`}>
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border", tx.type === 'deposit' ? "bg-primary/10 border-primary/20 text-primary" : "bg-accent/10 border-accent/20 text-accent")}>
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-medium text-white text-lg">{tx.protocol || "DeFi Protocol"}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""} {tx.details ? `• ${tx.details}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-bold text-white text-xl">${tx.amountUsd} USDT</p>
                      {tx.amountBrl && <p className="text-sm text-muted-foreground">R$ {parseFloat(tx.amountBrl).toFixed(2)}</p>}
                      <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize border inline-block mt-1", tx.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : tx.status === 'processing' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20")}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
