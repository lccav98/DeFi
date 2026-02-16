import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, Loader2, Wallet, ShieldCheck, Banknote, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { TxHashLink } from "@/components/tx-hash-link";
import { loadStripe, type Stripe as StripeType } from "@stripe/stripe-js";

const PLATFORM_FEE = 1.5;
const EXCHANGE_RATE = 5.0;

let stripePromise: Promise<StripeType | null> | null = null;

function getStripe() {
  if (!stripePromise) {
    stripePromise = fetch("/api/stripe/config")
      .then((r) => r.json())
      .then((data) => loadStripe(data.publishableKey))
      .catch(() => null);
  }
  return stripePromise;
}

export function DepositModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "pix_payment" | "processing" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [feeInfo, setFeeInfo] = useState<{ feeUsd: string; netUsd: string } | null>(null);
  const [pixPaymentStatus, setPixPaymentStatus] = useState<"waiting" | "confirming" | "confirmed" | "error">("waiting");
  const [pipelineStarted, setPipelineStarted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const PROCESS_STAGES = [
    { id: 1, label: t("deposit.stage1"), icon: Banknote },
    { id: 2, label: t("deposit.stage2"), icon: Wallet },
    { id: 3, label: t("deposit.stage3"), icon: ArrowRight },
    { id: 4, label: t("deposit.stage4"), icon: ShieldCheck },
  ];

  const grossUsd = amount ? parseFloat(amount) / EXCHANGE_RATE : 0;
  const feeUsd = grossUsd * (PLATFORM_FEE / 100);
  const netUsd = grossUsd - feeUsd;

  const { data: txStatus } = useQuery<{
    stage: number;
    status: string;
    mintTxHash: string | null;
    bridgeTxHash: string | null;
    stakeTxHash: string | null;
    explorerBaseUrl: string | null;
    txLinks: { mint: string | null; bridge: string | null; stake: string | null };
  }>({
    queryKey: ["/api/transactions", txId, "status"],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${txId}/status`);
      return res.json();
    },
    enabled: !!txId && (step === "processing" || step === "success"),
    refetchInterval: step === "processing" ? 2000 : false,
  });

  useEffect(() => {
    if (txStatus?.status === "completed" && step === "processing") {
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments", user?.id] });
    }
  }, [txStatus, step, queryClient, user?.id]);

  const pollPaymentStatus = useCallback(async (secret: string, transactionId: string) => {
    const stripe = await getStripe();
    if (!stripe) return;

    const pollInterval = setInterval(async () => {
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(secret);
        if (paymentIntent?.status === "succeeded") {
          clearInterval(pollInterval);
          setPixPaymentStatus("confirmed");

          setStep("processing");
          if (!pipelineStarted) {
            setPipelineStarted(true);
            try {
              await apiRequest("POST", `/api/deposit/pix/${transactionId}/confirm`, {});
            } catch {
              for (let stage = 0; stage < 4; stage++) {
                try {
                  await apiRequest("POST", `/api/transactions/${transactionId}/process`, {});
                } catch {}
                if (stage < 3) await new Promise((r) => setTimeout(r, 2500));
              }
            }
          }
        } else if (paymentIntent?.status === "canceled" || paymentIntent?.status === "requires_payment_method") {
          clearInterval(pollInterval);
          setPixPaymentStatus("error");
        }
      } catch {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [pipelineStarted]);

  const handleCreatePixPayment = async () => {
    if (!user) return;
    try {
      const res = await apiRequest("POST", "/api/deposit/pix", {
        userId: user.id,
        amountBrl: amount,
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setTxId(data.transaction.id);
      if (data.fee) {
        setFeeInfo({ feeUsd: data.fee.amountUsd, netUsd: data.fee.netUsd });
      }
      setStep("pix_payment");

      const stripe = await getStripe();
      if (stripe && data.clientSecret) {
        const { error } = await stripe.confirmPixPayment(data.clientSecret, {
          return_url: window.location.href,
        });

        if (error) {
          if (error.type !== "validation_error") {
            toast({ title: t("auth.error"), description: error.message || t("deposit.errorGenerating"), variant: "destructive" });
          }
        }

        pollPaymentStatus(data.clientSecret, data.transaction.id);
      }
    } catch (err: any) {
      toast({ title: t("auth.error"), description: t("deposit.errorGenerating"), variant: "destructive" });
    }
  };

  const reset = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("amount");
      setAmount("");
      setTxId(null);
      setClientSecret(null);
      setFeeInfo(null);
      setPipelineStarted(false);
      setPixPaymentStatus("waiting");
    }, 500);
  };

  const displayNetUsd = feeInfo?.netUsd || netUsd.toFixed(2);
  const displayFeeUsd = feeInfo?.feeUsd || feeUsd.toFixed(2);
  const currentStage = txStatus?.stage || 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-lg py-6 rounded-xl font-bold cursor-pointer" data-testid="button-deposit">
          {t("deposit.depositBtn")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-foreground p-0 gap-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient" />
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-display font-bold text-center">
            {step === "amount" && t("deposit.investViaPix")}
            {step === "pix_payment" && t("deposit.scanPay")}
            {step === "processing" && t("deposit.automatingDefi")}
            {step === "success" && t("deposit.investmentActive")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <AnimatePresence mode="wait">
            {step === "amount" && (
              <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount" className="text-muted-foreground">{t("deposit.amountBrl")}</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">R$</span>
                    <Input id="deposit-amount" type="number" placeholder="0.00" className="pl-12 text-2xl font-display bg-white/5 border-white/10 focus:border-primary/50 h-14" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="input-deposit-amount" />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{t("deposit.minAmount")}</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.grossUsd")}</span>
                    <span className="font-mono font-medium">${grossUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.platformFee")} ({PLATFORM_FEE}%)</span>
                    <span className="font-mono text-yellow-500">-${feeUsd.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.netStaked")}</span>
                    <span className="font-mono font-bold text-primary" data-testid="text-usd-value">${netUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.estApy")}</span>
                    <span className="text-primary font-bold">12.5%</span>
                  </div>
                </div>
                <Button className="w-full h-12 text-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer" disabled={!amount || parseFloat(amount) < 50} onClick={handleCreatePixPayment} data-testid="button-generate-pix">
                  {t("deposit.payWithPix")}
                </Button>
              </motion.div>
            )}

            {step === "pix_payment" && (
              <motion.div key="pix_payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-display font-bold" data-testid="text-pix-amount">R$ {parseFloat(amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{t("deposit.fee")}: ${displayFeeUsd} | {t("deposit.staked")}: ${displayNetUsd}</p>
                </div>

                <div className="w-full bg-white/5 rounded-xl p-6 text-center space-y-4">
                  {pixPaymentStatus === "waiting" && (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">{t("deposit.pixRedirect")}</p>
                      <p className="text-xs text-muted-foreground animate-pulse">{t("deposit.waitingPayment")}</p>
                    </>
                  )}
                  {pixPaymentStatus === "confirming" && (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
                      <p className="text-sm text-yellow-500 font-medium">{t("deposit.confirmingPayment")}</p>
                    </>
                  )}
                  {pixPaymentStatus === "confirmed" && (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm text-green-500 font-medium">{t("deposit.paymentConfirmed")}</p>
                    </>
                  )}
                  {pixPaymentStatus === "error" && (
                    <>
                      <p className="text-sm text-red-500 font-medium">{t("deposit.paymentFailed")}</p>
                      <Button variant="outline" className="cursor-pointer" onClick={() => { setStep("amount"); setPixPaymentStatus("waiting"); }}>
                        {t("deposit.tryAgain")}
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>{t("deposit.stripeSecure")}</span>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 py-4">
                <div className="relative space-y-8 pl-4 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-white/10">
                  {PROCESS_STAGES.map((stage, index) => {
                    const isActive = index === currentStage || (index + 1) === currentStage;
                    const isCompleted = (index + 1) < currentStage || (index + 1 === currentStage && currentStage === 4);
                    const Icon = stage.icon;

                    const txHashForStage =
                      index === 0 ? txStatus?.mintTxHash :
                      index === 1 ? txStatus?.bridgeTxHash :
                      index === 2 || index === 3 ? txStatus?.stakeTxHash : null;

                    return (
                      <div key={stage.id} className="relative flex items-start gap-4">
                        <div className={cn("relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 mt-0.5", isCompleted ? "bg-primary border-primary text-black" : isActive ? "bg-card border-primary text-primary shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-card border-white/10 text-muted-foreground")}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                        </div>
                        <div className={cn("flex-1 transition-all duration-500", isActive || isCompleted ? "opacity-100" : "opacity-50")}>
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-white/5", isActive && "bg-primary/10 text-primary")}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={cn("text-sm font-medium", isActive && "text-primary")}>{stage.label}</span>
                          </div>
                          {txHashForStage && isCompleted && (
                            <div className="mt-2 ml-11">
                              <TxHashLink txHash={txHashForStage} explorerBaseUrl={txStatus?.explorerBaseUrl} compact />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-white">{t("deposit.successTitle")}</h3>
                  <p className="text-muted-foreground">{t("deposit.successDesc")}</p>
                </div>
                <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.stakedAmount")}</span>
                    <span className="font-mono text-white">${displayNetUsd} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.platformFee")}</span>
                    <span className="font-mono text-yellow-500">${displayFeeUsd}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("deposit.protocol")}</span>
                    <span className="text-accent font-medium">Aave V3 (Optimism)</span>
                  </div>
                </div>

                {(txStatus?.mintTxHash || txStatus?.bridgeTxHash || txStatus?.stakeTxHash) && (
                  <div className="w-full bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {t("blockchain.onChainProof")}
                    </div>
                    <div className="space-y-2">
                      {txStatus.mintTxHash && (
                        <TxHashLink txHash={txStatus.mintTxHash} explorerBaseUrl={txStatus.explorerBaseUrl} label={t("blockchain.mintProof")} />
                      )}
                      {txStatus.bridgeTxHash && (
                        <TxHashLink txHash={txStatus.bridgeTxHash} explorerBaseUrl={txStatus.explorerBaseUrl} label={t("blockchain.bridgeProof")} />
                      )}
                      {txStatus.stakeTxHash && (
                        <TxHashLink txHash={txStatus.stakeTxHash} explorerBaseUrl={txStatus.explorerBaseUrl} label={t("blockchain.stakeProof")} />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {t("blockchain.verifyYourself")} Etherscan
                    </p>
                  </div>
                )}

                <Button onClick={reset} className="w-full h-12 font-bold bg-white/10 hover:bg-white/20 cursor-pointer" data-testid="button-return-dashboard">
                  {t("deposit.returnDashboard")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
