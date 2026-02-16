import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import type { Investment } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";

const WITHDRAWAL_FEE = 0.02;

interface WithdrawModalProps {
  investment: Investment;
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ investment, isOpen, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState<"confirm" | "processing" | "success">("confirm");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const currentValue = parseFloat(investment.currentValue);
  const fee = currentValue * WITHDRAWAL_FEE;
  const netUsd = currentValue - fee;
  const netBrl = netUsd * 5.0;

  const handleWithdraw = async () => {
    if (!user) return;
    setLoading(true);
    setStep("processing");

    try {
      await new Promise((r) => setTimeout(r, 2000));

      const res = await apiRequest("POST", "/api/withdraw", {
        userId: user.id,
        investmentId: investment.id,
        pixKey,
      });
      const data = await res.json();
      setSummary(data.summary);

      await new Promise((r) => setTimeout(r, 1500));
      setStep("success");

      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments", user.id] });
    } catch (err: any) {
      toast({ title: t("withdraw.errorTitle"), description: t("withdraw.errorDesc"), variant: "destructive" });
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("confirm");
      setPixKey("");
      setSummary(null);
      setLoading(false);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-foreground p-0 gap-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />

        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-display font-bold text-center">
            {step === "confirm" && t("withdraw.title")}
            {step === "processing" && t("withdraw.processing")}
            {step === "success" && t("withdraw.complete")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <AnimatePresence mode="wait">
            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-500 font-medium">{t("withdraw.earlyWarningTitle")}</p>
                    <p className="text-muted-foreground">{t("withdraw.earlyWarningDesc")}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.positionValue")}</span>
                    <span className="font-mono font-bold text-white">${currentValue.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.protocol")}</span>
                    <span className="text-accent font-medium">{investment.protocol} ({investment.network})</span>
                  </div>
                  <div className="border-t border-white/5 my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.withdrawalFee")}</span>
                    <span className="font-mono text-red-400">-${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.netAmountUsd")}</span>
                    <span className="font-mono font-bold text-white">${netUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.youReceive")}</span>
                    <span className="font-mono font-bold text-primary text-lg">R$ {netBrl.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix-key" className="text-muted-foreground">{t("withdraw.pixKeyLabel")}</Label>
                  <Input
                    id="pix-key"
                    placeholder={t("withdraw.pixKeyPlaceholder")}
                    className="bg-white/5 border-white/10 h-12 focus:border-primary/50"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    data-testid="input-pix-key"
                  />
                </div>

                <Button
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] cursor-pointer"
                  onClick={handleWithdraw}
                  disabled={loading}
                  data-testid="button-confirm-withdraw"
                >
                  {t("withdraw.confirmBtn")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center space-y-6 py-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-white">{t("withdraw.processingText")}</p>
                  <p className="text-sm text-muted-foreground">{t("withdraw.processingDesc")}</p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-white">{t("withdraw.sentToPix")}</h3>
                  <p className="text-muted-foreground">{t("withdraw.fundsUnstaked")}</p>
                </div>
                <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.amountSent")}</span>
                    <span className="font-mono text-primary font-bold text-lg">R$ {summary?.netBrl || netBrl.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("withdraw.feeCharged")}</span>
                    <span className="font-mono text-muted-foreground">${summary?.feeUsd || fee.toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={handleClose} className="w-full h-12 font-bold bg-white/10 hover:bg-white/20 cursor-pointer" data-testid="button-close-withdraw">
                  {t("withdraw.returnInvestments")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
