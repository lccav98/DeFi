import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, TrendingUp, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { TxHashLink, TxProofCard } from "@/components/tx-hash-link";
import { useState } from "react";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const { data: txs = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    enabled: !!user,
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">{t("transactions.title")}</h1>
          <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary">{t("blockchain.transparencyTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("blockchain.transparencyDesc")}</p>
          </div>
        </div>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>{t("transactions.history")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : txs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">{t("transactions.noTransactions")}</p>
                <p className="text-sm">{t("transactions.emptySubtitle")}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {txs.map((tx) => {
                  const hasProofs = tx.mintTxHash || tx.bridgeTxHash || tx.stakeTxHash || tx.unstakeTxHash;
                  const isExpanded = expandedTx === tx.id;

                  return (
                    <div key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                      <div
                        className={cn("flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-white/5 transition-colors gap-4", hasProofs && "cursor-pointer")}
                        onClick={() => hasProofs && setExpandedTx(isExpanded ? null : tx.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border", tx.type === 'deposit' ? "bg-primary/10 border-primary/20 text-primary" : tx.type === 'withdrawal' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-accent/10 border-accent/20 text-accent")}>
                            {tx.type === 'deposit' ? <ArrowDownRight className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-medium text-white text-lg">{tx.protocol || "DeFi Protocol"}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}
                            </p>
                            {hasProofs && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {tx.mintTxHash && <TxHashLink txHash={tx.mintTxHash} explorerBaseUrl={tx.explorerBaseUrl} compact />}
                                {tx.bridgeTxHash && <TxHashLink txHash={tx.bridgeTxHash} explorerBaseUrl={tx.explorerBaseUrl} compact />}
                                {tx.stakeTxHash && <TxHashLink txHash={tx.stakeTxHash} explorerBaseUrl={tx.explorerBaseUrl} compact />}
                                {tx.unstakeTxHash && <TxHashLink txHash={tx.unstakeTxHash} explorerBaseUrl={tx.explorerBaseUrl} compact />}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="font-bold text-white text-xl">${tx.amountUsd} USDT</p>
                          {tx.amountBrl && <p className="text-sm text-muted-foreground">R$ {parseFloat(tx.amountBrl).toFixed(2)}</p>}
                          <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize border inline-block mt-1", tx.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : tx.status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" : tx.status === 'processing' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20")}>
                            {t(`common.status.${tx.status}`)}
                          </span>
                        </div>
                      </div>

                      {isExpanded && hasProofs && (
                        <div className="px-6 pb-6">
                          <TxProofCard
                            mintTxHash={tx.mintTxHash}
                            bridgeTxHash={tx.bridgeTxHash}
                            stakeTxHash={tx.stakeTxHash}
                            unstakeTxHash={tx.unstakeTxHash}
                            explorerBaseUrl={tx.explorerBaseUrl}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
