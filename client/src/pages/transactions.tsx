import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArrowDownRight, TrendingUp, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Transactions</h1>
            <p className="text-muted-foreground">View your complete deposit and yield history.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/5 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border",
                      tx.type === 'deposit' 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-accent/10 border-accent/20 text-accent"
                    )}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium text-white text-lg">{tx.protocol}</p>
                      <p className="text-sm text-muted-foreground">{tx.date} • {tx.details}</p>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <p className="font-bold text-white text-xl">{tx.converted || tx.amount}</p>
                    <div className="flex items-center gap-2 md:justify-end mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize border",
                        tx.status === 'completed' 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Duplicate transactions to fill the page for demo */}
              {[...transactions, ...transactions].map((tx, i) => (
                <div key={`${tx.id}-${i}`} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/5 transition-colors gap-4 opacity-50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border",
                      tx.type === 'deposit' 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-accent/10 border-accent/20 text-accent"
                    )}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium text-white text-lg">{tx.protocol}</p>
                      <p className="text-sm text-muted-foreground">2024-01-2{i} • {tx.details}</p>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <p className="font-bold text-white text-xl">{tx.converted || tx.amount}</p>
                    <div className="flex items-center gap-2 md:justify-end mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize border",
                        tx.status === 'completed' 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
