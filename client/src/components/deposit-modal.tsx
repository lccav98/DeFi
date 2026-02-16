import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, QrCode, CheckCircle2, Loader2, Wallet, ShieldCheck, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

const PROCESS_STAGES = [
  { id: 1, label: "Detecting PIX Deposit", icon: Banknote },
  { id: 2, label: "Minting Digital Real (DPIX)", icon: Wallet },
  { id: 3, label: "Bridging to DeFi Network", icon: ArrowRight },
  { id: 4, label: "Staking in Yield Protocol", icon: ShieldCheck },
];

export function DepositModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "qrcode" | "processing" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [currentStage, setCurrentStage] = useState(0);
  const [pixKey, setPixKey] = useState("");
  const [txId, setTxId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleGeneratePix = async () => {
    if (!user) return;
    try {
      const res = await apiRequest("POST", "/api/deposit", {
        userId: user.id,
        amountBrl: amount,
      });
      const data = await res.json();
      setPixKey(data.pixKey);
      setTxId(data.transaction.id);
      setStep("qrcode");
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to generate PIX code", variant: "destructive" });
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    toast({ title: "PIX Key Copied", description: "Paste this code in your banking app to pay." });
    setTimeout(() => setStep("processing"), 2000);
  };

  const processStage = useCallback(async () => {
    if (!txId) return;
    try {
      const res = await apiRequest("POST", `/api/transactions/${txId}/process`, {});
      const data = await res.json();
      if (data.completed) {
        setCurrentStage(3);
        setTimeout(() => {
          setStep("success");
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["/api/transactions", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["/api/investments", user?.id] });
        }, 1000);
      }
    } catch {}
  }, [txId, queryClient]);

  useEffect(() => {
    if (step === "processing" && txId) {
      const interval = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev >= PROCESS_STAGES.length - 1) {
            clearInterval(interval);
            return prev;
          }
          processStage();
          return prev + 1;
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step, txId, processStage]);

  const reset = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("amount");
      setAmount("");
      setCurrentStage(0);
      setTxId(null);
      setPixKey("");
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-lg py-6 rounded-xl font-bold cursor-pointer" data-testid="button-deposit">
          Deposit PIX & Start Earning
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-foreground p-0 gap-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient" />
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-display font-bold text-center">
            {step === "amount" && "Invest via PIX"}
            {step === "qrcode" && "Scan & Pay"}
            {step === "processing" && "Automating DeFi..."}
            {step === "success" && "Investment Active!"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <AnimatePresence mode="wait">
            {step === "amount" && (
              <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount" className="text-muted-foreground">Amount (BRL)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">R$</span>
                    <Input id="deposit-amount" type="number" placeholder="0.00" className="pl-12 text-2xl font-display bg-white/5 border-white/10 focus:border-primary/50 h-14" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="input-deposit-amount" />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">Min: R$ 50.00</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. USD Value</span>
                    <span className="font-mono font-medium" data-testid="text-usd-value">${amount ? (parseFloat(amount) / 5.0).toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. APY</span>
                    <span className="text-primary font-bold">12.5%</span>
                  </div>
                </div>
                <Button className="w-full h-12 text-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer" disabled={!amount || parseFloat(amount) < 50} onClick={handleGeneratePix} data-testid="button-generate-pix">
                  Generate PIX Code
                </Button>
              </motion.div>
            )}

            {step === "qrcode" && (
              <motion.div key="qrcode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-white p-4 rounded-xl">
                    <QrCode className="w-48 h-48 text-black" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Pay with your banking app</p>
                  <p className="text-2xl font-display font-bold" data-testid="text-pix-amount">R$ {parseFloat(amount).toFixed(2)}</p>
                </div>
                <Button variant="outline" className="w-full h-12 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer" onClick={handleCopyPix} data-testid="button-copy-pix">
                  Copy PIX Code
                </Button>
                <p className="text-xs text-center text-muted-foreground animate-pulse">Waiting for payment...</p>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 py-4">
                <div className="relative space-y-8 pl-4 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-white/10">
                  {PROCESS_STAGES.map((stage, index) => {
                    const isActive = index === currentStage;
                    const isCompleted = index < currentStage;
                    const Icon = stage.icon;
                    return (
                      <div key={stage.id} className="relative flex items-center gap-4">
                        <div className={cn("relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500", isCompleted ? "bg-primary border-primary text-black" : isActive ? "bg-card border-primary text-primary shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-card border-white/10 text-muted-foreground")}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                        </div>
                        <div className={cn("flex items-center gap-3 transition-all duration-500", isActive ? "opacity-100 scale-100" : "opacity-50")}>
                          <div className={cn("p-2 rounded-lg bg-white/5", isActive && "bg-primary/10 text-primary")}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={cn("text-sm font-medium", isActive && "text-primary")}>{stage.label}</span>
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
                  <h3 className="text-2xl font-bold font-display text-white">Investment Active!</h3>
                  <p className="text-muted-foreground">Your funds have been successfully bridged and staked.</p>
                </div>
                <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staked Amount</span>
                    <span className="font-mono text-white">${(parseFloat(amount) / 5.0).toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Protocol</span>
                    <span className="text-accent font-medium">Aave V3 (Optimism)</span>
                  </div>
                </div>
                <Button onClick={reset} className="w-full h-12 font-bold bg-white/10 hover:bg-white/20 cursor-pointer" data-testid="button-return-dashboard">
                  Return to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
