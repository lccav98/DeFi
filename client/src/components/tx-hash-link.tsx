import { ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TxHashLinkProps {
  txHash: string | null | undefined;
  explorerBaseUrl?: string | null;
  label?: string;
  compact?: boolean;
}

export function TxHashLink({ txHash, explorerBaseUrl, label, compact = false }: TxHashLinkProps) {
  const { t } = useTranslation();

  if (!txHash) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{label ? `${label}: ` : ""}{t("blockchain.pending")}</span>
      </div>
    );
  }

  const explorerUrl = explorerBaseUrl
    ? `${explorerBaseUrl}/tx/${txHash}`
    : `https://optimistic.etherscan.io/tx/${txHash}`;

  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors group",
        compact
          ? "text-xs text-primary/80 hover:text-primary"
          : "text-xs px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 hover:border-primary/20"
      )}
      data-testid={`link-tx-${txHash.slice(0, 8)}`}
    >
      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
      {label && <span className="text-muted-foreground">{label}:</span>}
      <span className="font-mono font-medium">{shortHash}</span>
      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

interface TxProofCardProps {
  mintTxHash?: string | null;
  bridgeTxHash?: string | null;
  stakeTxHash?: string | null;
  unstakeTxHash?: string | null;
  explorerBaseUrl?: string | null;
}

export function TxProofCard({ mintTxHash, bridgeTxHash, stakeTxHash, unstakeTxHash, explorerBaseUrl }: TxProofCardProps) {
  const { t } = useTranslation();
  const hasAnyHash = mintTxHash || bridgeTxHash || stakeTxHash || unstakeTxHash;

  if (!hasAnyHash) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/5">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        {t("blockchain.onChainProof")}
      </div>
      <div className="space-y-2">
        {mintTxHash && (
          <TxHashLink txHash={mintTxHash} explorerBaseUrl={explorerBaseUrl} label={t("blockchain.mintProof")} />
        )}
        {bridgeTxHash && (
          <TxHashLink txHash={bridgeTxHash} explorerBaseUrl={explorerBaseUrl} label={t("blockchain.bridgeProof")} />
        )}
        {stakeTxHash && (
          <TxHashLink txHash={stakeTxHash} explorerBaseUrl={explorerBaseUrl} label={t("blockchain.stakeProof")} />
        )}
        {unstakeTxHash && (
          <TxHashLink txHash={unstakeTxHash} explorerBaseUrl={explorerBaseUrl} label={t("blockchain.unstakeProof")} />
        )}
      </div>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        {t("blockchain.transparencyDesc")}
      </p>
    </div>
  );
}
