import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowRight, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, LANG_LABELS, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  const langFlags: Record<Language, string> = { en: "EN", es: "ES", pt: "BR" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, displayName || username);
      }
    } catch (err: any) {
      toast({
        title: t("auth.error"),
        description: err.message?.includes("409") ? t("auth.errorExists") : 
                     err.message?.includes("401") ? t("auth.errorInvalid") : t("auth.errorGeneric"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            data-testid="button-auth-language"
          >
            <Globe className="w-4 h-4" />
            <span>{langFlags[language]}</span>
          </button>
          {langMenuOpen && (
            <div className="absolute top-full right-0 mt-1 bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-[160px]">
              {(["en", "es", "pt"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                  className={cn("w-full px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-2 cursor-pointer", language === lang && "text-primary bg-primary/5")}
                >
                  <span className="font-bold text-xs w-6">{langFlags[lang]}</span>
                  <span>{LANG_LABELS[lang]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="w-full max-w-md glass-panel border-white/10 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient" />
        
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">DeFi Direct</h1>
              <p className="text-muted-foreground mt-1">
                {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-muted-foreground">{t("auth.displayName")}</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 h-12 focus:border-primary/50"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  data-testid="input-displayName"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground">{t("auth.username")}</Label>
              <Input
                id="username"
                placeholder="your_username"
                className="bg-white/5 border-white/10 h-12 focus:border-primary/50"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 h-12 focus:border-primary/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
              disabled={loading}
              data-testid="button-submit"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? t("auth.signIn") : t("auth.createAccountBtn")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsLogin(!isLogin)}
              data-testid="button-toggle-auth"
            >
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
